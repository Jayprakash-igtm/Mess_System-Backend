import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// // Fix relative path for ESM (if using ES modules)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Read Firebase Service Account JSON
// const serviceAccount = JSON.parse(
//   readFileSync(path.join(__dirname, "./firebase-admin-key.json"), "utf8") // Adjust path if needed
// );

const decodedKey = Buffer.from(process.env.FIREBASE_ADMIN_KEY_BASE64, "base64").toString("utf-8");

try {
  const firebaseAdminKey = JSON.parse(decodedKey); // ✅ Properly parse JSON
  admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminKey),
      databaseURL: "https://hostel-mess-11f93.firebaseio.com",
  });
  console.log("🔥 Firebase Admin Initialized Successfully!");
} catch (error) {
  console.error("❌ Failed to parse Firebase Admin key:", error);
}

// const firebaseAdminKey = JSON.parse(
//   Buffer.from(process.env.FIREBASE_ADMIN_KEY_BASE64, "base64").toString("utf-8")
// );

// //Initialize Firebase Admin
// admin.initializeApp({
//   credential: admin.credential.cert(firebaseAdminKey),
//   databaseURL: "https://hostel-mess-11f93.firebaseio.com",
// });
// Instance for authentication
 const Auth = admin.auth();

export default Auth;
