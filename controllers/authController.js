import Auth from "../firebase.js"; // Firebase Admin SDK instance
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from "moment";

dotenv.config();

// User Signup Function
export const userSignup = async (req, res) => {
  const { password, EnrollNum, name, course, Number, email, year } = req.body;

  try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Firebase Authentication
      const user = await Auth.createUser({ email, password });

      // Store user details and hashed password in Firestore
      await admin.firestore().collection("users").doc(user.uid).set({
          EnrollNum,
          name,
          password: hashedPassword, // Store hashed password
          //createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          course,
          Number,
          email,
          year
      });

      res.status(201).json({ message: "User created successfully"});
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const JWT_SECRET = process.env.JWT_SECRET; // Secret key from .env
const JWT_EXPIRES_IN = '30d'; // Token expires in 30 days


const generateToken = (uid) => {
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  };

export const userLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Fetch user from Firebase Auth
      const userRecord = await Auth.getUserByEmail(email);
  
      // Fetch user data from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User data not found in Firestore' });
      }
  
      const userData = userDoc.data();
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid Credentials' });
      }
  
      // Generate JWT token with 1-month expiry
      const token = generateToken(userRecord.uid);
  
      // Set the token in an HTTP-Only Cookie (valid for 1 month)
      res.cookie('authToken', token, {
        httpOnly: true, // Prevents access from JavaScript
        secure: true, // Ensures it's only sent over HTTPS
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month in milliseconds
      });
  
      res.status(200).json({
        message: 'Login successful',
        user: {
          Token: token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  };