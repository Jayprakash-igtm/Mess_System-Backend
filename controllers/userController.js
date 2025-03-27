
import admin from "firebase-admin";

// Firestore instance
const db = admin.firestore();

// ✅ Fetch user data from Firestore
export const getUserData = async (req, res) => {
    try {
        // ✅ Get the authenticated user's UID from middleware
        const uid = req.user.uid;
        
        // ✅ Fetch user document from Firestore
        const userDoc = await db.collection("users").doc(uid).get();

        // ✅ Check if user exists
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Return user data
        return res.status(200).json({
            message: "User data retrieved successfully",
            user: userDoc.data(),
        });

    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
