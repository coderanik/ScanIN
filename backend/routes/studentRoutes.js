import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { getMyRegistrations } from '../controllers/studentController.js';

const router = express.Router();

router.get('/registrations', auth, getMyRegistrations);

export default router; 