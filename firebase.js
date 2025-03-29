import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

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

 const Auth = admin.auth();

export default Auth;
