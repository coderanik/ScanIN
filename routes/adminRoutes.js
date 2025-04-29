import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createEvent, getAttendees, checkInUser, exportAttendees } from '../controllers/adminController.js';

const router = express.Router();

router.post('/event', auth, authorizeRoles('admin'), createEvent);
router.get('/attendees/:eventId', auth, authorizeRoles('admin'), getAttendees);
router.post('/checkin', auth, authorizeRoles('admin'), checkInUser);
router.get('/export/:eventId', auth, authorizeRoles('admin'), exportAttendees);

export default router;