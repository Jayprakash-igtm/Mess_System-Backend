import express from 'express';
import {initiatePayment,phonePeWebhook}  from '../controllers/paymentController.js';

const router = express.Router();

// Generate token route
router.post('/full_month',initiatePayment);

router.post('/webhook', phonePeWebhook);

export default router;