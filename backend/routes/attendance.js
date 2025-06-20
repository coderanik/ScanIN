import express from 'express';
import { generateEventQR, recordAttendance, exportAttendance } from '../controllers/attendanceController.js';
import { body } from 'express-validator';

const router = express.Router();

// Generate QR code for an event
router.get('/event/:eventId/qr', generateEventQR);

// Record attendance
router.post(
  '/event/:eventId/check-in',
  [
    body('participantName').notEmpty().withMessage('Participant name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  recordAttendance
);

// Export attendance data
router.get('/event/:eventId/export', exportAttendance);

export default router; 