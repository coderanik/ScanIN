import express from 'express';
import { body } from 'express-validator';
import { auth, isAdmin } from '../middleware/authMiddleware.js';
import {
  createEvent,
  registerForEvent,
  checkIn,
  getEventAttendees
} from '../controllers/eventController.js';

const router = express.Router();

// Event creation validation
const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required')
];

// Routes
router.post('/', auth, isAdmin, validateEvent, createEvent);
router.post('/:eventId/register', auth, registerForEvent);
router.post('/:eventId/check-in/:userId', auth, isAdmin, checkIn);
router.get('/:eventId/attendees', auth, isAdmin, getEventAttendees);

export default router; 