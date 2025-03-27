import express from 'express';
import { getSuccessfulPayments } from '../controllers/successfulPayController.js';

const router = express.Router();

// Generate token route
router.get('/successful_payments', getSuccessfulPayments);

export default router;