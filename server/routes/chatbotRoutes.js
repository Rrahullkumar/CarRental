import express from 'express';
import { chatCompletion, healthCheck } from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', chatCompletion);

// GET /api/chatbot/health - Check if chatbot service is working
router.get('/health', healthCheck);

export default router;
