import admin from "firebase-admin";

// Firestore instance
const db = admin.firestore();

export const deleteRequestByUserData = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "uid as parameter required" });
        }

        // 🔍 Search for the document in the "Requests" collection
        const requestSnapshot = await db.collection("Requests")
            .where("uid", "==", uid)
            .limit(1) // Only fetch one document
            .get();

        if (requestSnapshot.empty) {
            return res.status(404).json({ error: "Request not found" });
        }

        // Get document ID
        const requestDoc = requestSnapshot.docs[0];
        const requestId = requestDoc.id;

        // 🗑️ Delete the document
        await db.collection("Requests").doc(requestId).delete();

        res.status(200).json({ message: "Request deleted successfully" });

    } catch (error) {
        console.error("Error deleting request:", error);
        res.status(500).json({ error: "Failed to delete request" });
    }
};
