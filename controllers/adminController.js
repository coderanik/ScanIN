import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendees = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId }).populate('userId', 'name email studentId');
    res.json({ attendees: registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkInUser = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const registration = await Registration.findOne({ userId, eventId });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.checkedIn = true;
    await registration.save();

    res.json({ message: 'Check-in successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const exportAttendees = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId }).populate('userId', 'name email studentId');
    const exportData = registrations.map(r => ({
      name: r.userId.name,
      email: r.userId.email,
      studentId: r.userId.studentId,
      checkedIn: r.checkedIn
    }));
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
