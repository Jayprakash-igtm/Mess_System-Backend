import axios from "axios";
import crypto from "crypto";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firestore instance
const db = admin.firestore();

// PhonePe Config
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL; // Sandbox or Production

export const phonePeWebhook = async (req, res) => {
    const { transactionId, status, amount } = req.body;

    // ✅ Validate request body
    if (!transactionId || !status || !amount) {
        return res.status(400).json({ error: "Invalid request. Missing required fields." });
    }

    try {
        // 🔍 ✅ Find user by transactionId in Firestore
        const usersSnapshot = await db.collection("users")
            .where("transactionId", "==", transactionId)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            return res.status(404).json({ error: "Transaction not found in Firestore" });
        }

        const userDoc = usersSnapshot.docs[0];
        const uid = userDoc.id; // Get Firebase UID
        const userData = userDoc.data();

        // ✅ Prevent duplicate updates
        if (userData.paymentStatus === "SUCCESS") {
            return res.status(200).json({ message: "Payment already processed" });
        }

        // ✅ Verify amount to prevent fraud
        if (userData.paymentAmount !== amount) {
            return res.status(400).json({ error: "Amount mismatch. Possible tampering detected." });
        }

        // 🔒 ✅ Verify Webhook Authenticity (HMAC Validation)
        const expectedChecksumString = `${PHONEPE_MERCHANT_ID}|${transactionId}|${PHONEPE_SALT_KEY}`;
        const expectedChecksum = crypto.createHash("sha256").update(expectedChecksumString).digest("hex");
        const expectedFinalChecksum = `${expectedChecksum}###${PHONEPE_SALT_INDEX}`;

        if (req.headers["x-verify"] !== expectedFinalChecksum) {
            return res.status(403).json({ error: "Invalid request. Checksum verification failed." });
        }

        let phonePeStatus = "FAILED"; // Default

        try {
            // 🔍 ✅ Verify transaction with PhonePe
            const verifyResponse = await axios.get(
                `${PHONEPE_BASE_URL}/pg/v1/status/${transactionId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-VERIFY": expectedFinalChecksum,
                        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
                    },
                }
            );

            const validStatus = ["PAYMENT_SUCCESS", "PAYMENT_PENDING", "PAYMENT_FAILED"];
            
            if (validStatus.includes(verifyResponse.data.code)) {
                phonePeStatus = verifyResponse.data.code.replace("PAYMENT_", ""); // Converts to "SUCCESS", "PENDING", "FAILED"
            } else {
                console.warn("Unexpected PhonePe status:", verifyResponse.data.code);
                return res.status(400).json({ error: "Unexpected response from PhonePe." });
            }
        } catch (verificationError) {
            console.error("PhonePe verification failed:", verificationError.message);
            return res.status(500).json({ error: "PhonePe verification failed. Could not fetch status." });
        }

        // ✅ Only update Firestore if payment is successful or pending
        if (phonePeStatus === "SUCCESS" || phonePeStatus === "PENDING") {
            await db.collection("users").doc(uid).update({
                paymentStatus: phonePeStatus,
                paymentDate: admin.firestore.FieldValue.serverTimestamp(),
            });

            return res.json({ message: "Payment status updated", paymentStatus: phonePeStatus });
        } else {
            return res.status(400).json({ error: "Payment failed or could not verify payment status." });
        }

    } catch (error) {
        console.error("Webhook processing error:", error.message);
        return res.status(500).json({ error: "Webhook processing failed", details: error.message });
    }
};
