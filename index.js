import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
 import userRoutes from './routes/userRoutes.js';
 import paymentRoutes from './routes/paymentRoutes.js'
import tokenRoutes from './routes/tokenRoutes.js'
import cors from "cors"
import verifyToken from "./middleware/AuthMiddleware.js"
import successpayroute from "./routes/successpayroute.js"
import rateLimit from 'express-rate-limit'
import {saveUserRequest} from "./controllers/requestController.js"
import {getAllRequests} from "./controllers/getAllReqController.js"
import {deleteRequestByUserData} from "./controllers/acceptRequestController.js"

// Load environment variables from .env file
dotenv.config();

const app= express();
const PORT = process.env.PORT || 3000;


const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 250, // limit each IP to 250 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({ origin: true })); // Enable CORS
app.use(limiter); // Apply rate limit to all routes


// Routes
app.use('/auth', authRoutes); // Authentication routes (login, signup)
app.use('/user',verifyToken, userRoutes); // User-related routes (profile)
app.use('/initiate_payment',verifyToken, paymentRoutes); // Payment-related routes (payment history)
app.use('/token',verifyToken, tokenRoutes); // Token-related routes (generate token)
app.use('/admin',successpayroute);
 app.post('/request',verifyToken, saveUserRequest)
 app.get('/get_requests', getAllRequests)
 app.delete(`/accept_request/:uid`,deleteRequestByUserData)

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging

  // Custom error handling for MealPeriodError
  if (err.name === 'MealPeriodError') {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Handle other errors
  res.status(500).json({
    message: 'Something went wrong on the server!',
    error: err.message, // Include the error message in the response
  });
});

app.listen(PORT, ()=> console.log(`Server is running at http://localhost:${PORT}`));
//exports.api = functions.https.onRequest(app);


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
