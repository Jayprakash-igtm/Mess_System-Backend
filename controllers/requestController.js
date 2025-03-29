import admin from "firebase-admin";

const db = admin.firestore();

export const saveUserRequest = async (req, res) => {
    try {
        // Extract UID from the authenticated user (set by middleware)
        const { uid } = req.user;

        if (!uid) {
            return res.status(401).json({ error: "Unauthorized: UID missing" });
        }

        // Fetch user details from Firestore using UID
        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();

        const { name, Number, EnrollNum, course } = userData;

        if (!name || !Number || !EnrollNum || !course) {
            return res.status(400).json({ error: "Incomplete user data" });
        }

         // Generate Firestore Timestamp & Human-readable Date
         const now = new Date();
         const requestedAt = {
             date: now.toISOString().split("T")[0], // Stores date as "YYYY-MM-DD"
         };

        // Save request to Firestore (Requests collection)
        await db.collection("Requests").add({
            uid,
            name,
            Number,
            EnrollNum,
            course,
            requestedAt
        });

        return res.status(201).json({ message: "Request sent successfully" });
    } catch (error) {
        console.error("Error saving request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
