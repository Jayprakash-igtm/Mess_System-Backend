import admin from "firebase-admin";

// Firestore instance
const db = admin.firestore();

export const getAllRequests = async (req, res) => {
    try {
        // Fetch all documents from the Requests collection
        const requestsSnapshot = await db.collection("Requests").get();

        if (requestsSnapshot.empty) {
            return res.status(404).json({ error: "No requests found." });
        }

        // Extract data from each document
        const requests = requestsSnapshot.docs.map(doc => ({
            id: doc.id, // Document ID
            ...doc.data() // Spread the document data
        }));

        // Send the response with the data
        res.status(200).json({ requests });

    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ error: "Failed to fetch requests." });
    }
};
