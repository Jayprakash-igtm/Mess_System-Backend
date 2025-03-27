import express from 'express';
import { userLogin, userSignup } from '../controllers/authController.js';

const router = express.Router();

// Signup route - Accepts email and password
router.post('/signup', (req, res) => {
  const { email, password, EnrollNum, name, course } = req.body;

  // Validate input
  if (!email || !password || !EnrollNum || !name || !course) {
    return res.status(400).json({ message: 'All Fields are required.' });
  }

  // Call the userSignup function from authController
  userSignup(req, res);
});

// Login route - Accepts email and password
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Call the userLogin function from authController
  userLogin(req, res);
});

export default router;