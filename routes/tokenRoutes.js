import express from 'express';
import { generateToken } from '../controllers/tokenController.js';

const router = express.Router();

// Generate token route
router.get('/generate', generateToken);

export default router;