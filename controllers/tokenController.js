import admin from "firebase-admin";
import moment from "moment";

// Custom error class for meal period errors
class MealPeriodError extends Error {
    constructor(message) {
      super(message);
      this.name = 'MealPeriodError';
    }
  }

  // Firestore instance
const db = admin.firestore();
  
  // Global variables to track the current period and counter
  let currentPeriod = null; // Tracks the current meal period
  let counter = 1; // Start counter from 1
  

  // Function to get the current meal period based on the time
  const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours();
  
    if (hours >= 7 && hours < 10) return 'breakfast';
    if (hours >= 12 && hours < 15) return 'lunch';
    if (hours >= 16 && hours < 19) return 'evening';
    if (hours >= 20 && hours < 23) return 'dinner';
    return null; // Outside meal periods
  };
  
  // Updated function to check meal payment before generating a token

  export const generateToken = async (req, res, next) => {
    try {
      // ✅ Validate request: Only allow headers
        if ( Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
            throw new Error("Invalid request. query or body not allowed");
        }

      const uid = req.user.uid; // User authentication middleware should provide this
      const period = getCurrentPeriod(); // Get the current meal period
  
      // Check if the period has changed
      if (period !== currentPeriod) {
        // Reset the counter and update the current period
        counter = 1;
        currentPeriod = period;
      }
  
      // If outside meal periods, throw a custom error
      if (!period) {
        throw new MealPeriodError(
          'No meal period is active. Tokens are only generated during breakfast, lunch, evening, or dinner.'
        );
      }


       //  **Check Firestore for valid payment**
       const userDoc = await db.collection("users").doc(uid).get();

       if (!userDoc.exists) {
           return res.status(404).json({ error: "User not found." });
       }

       const userData = userDoc.data();
       const currentMonth = moment().format("YYYY-MM");

       // List of UIDs that should be exempted from payment checks
       const EXEMPTED_UIDS = ["jvVa63hkN8VnA7apsanS6cVidqq1"]; // Replace with actual UID values

       
       // ❌ If the user hasn't paid, deny access (unless they are exempted)
       if (!EXEMPTED_UIDS.includes(uid) &&
        (!userData.validUntil || userData.validUntil !== currentMonth || userData.paymentStatus !== "SUCCESS")) {
        return res.status(403).json({ error: "Payment required to get a meal token." });
       }
  
      // Generate the token (current counter value)
      const token = counter;
  
      // Increment the counter for the next request
      counter++;
  
      // Send the token as JSON response
      res.status(200).json({
        message: `Token generated successfully for ${currentPeriod}!`,
        token,
        period: currentPeriod, // Include the current period in the response
      });
    } catch (error) {
      // Pass the error to the error-handling middleware
      next(error);
    }
  };