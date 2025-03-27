// import admin from "firebase-admin";

// // Firestore instance
// const db = admin.firestore();

// export const getSuccessfulPayments = async (req, res) => {
//     try {
//         const usersSnapshot = await db.collection("users")
//             .where("paymentStatus", "==", "SUCCESS")
//             .get();

//         if (usersSnapshot.empty) {
//             return res.status(404).json({ error: "No successful payments found." });
//         }

//         const paidUsers = usersSnapshot.docs.map(doc => ({
//             amount: doc.data().paymentAmount,
//             paymentDate: doc.data().paymentDate,
//             validUntil: doc.data().validUntil,
//             Name:doc.data().name,
//             EnrollmentNumber: doc.data().EnrollNum,
//             Course: doc.data().course
//         }));

//         res.json({ paidUsers });

//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch successful payments." });
//     }
// };
import admin from "firebase-admin";

// Firestore instance
const db = admin.firestore();

export const getSuccessfulPayments = async (req, res) => {
    try {
        const usersSnapshot = await db.collection("users")
            .where("paymentStatus", "==", "SUCCESS")
            .get();

        if (usersSnapshot.empty) {
            return res.status(404).json({ error: "No successful payments found." });
        }

        const paidUsers = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                amount: data.paymentAmount,
                paymentDate: data.paymentDate ? new Date(data.paymentDate._seconds * 1000).toLocaleString() : "N/A",
                validUntil: data.validUntil,
                Name: data.name,
                EnrollmentNumber: data.EnrollNum,
                Course: data.course
            };
        });

        res.json({ paidUsers });

    } catch (error) {
        console.error("Error fetching successful payments:", error);
        res.status(500).json({ error: "Failed to fetch successful payments." });
    }
};
