import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js'; // Import the Registration model
import { generateQRCode } from '../utils/qrGenerator.js';
import { sendEventRegistrationEmail } from '../utils/emailSender.js';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching events', 
      error: error.message 
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name')
      .populate('attendees.user', 'name email studentId');

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching event', 
      error: error.message 
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, time } = req.body;

    const event = new Event({
      title,
      description,
      location,
      date,
      time,
      createdBy: req.user._id
    });

    await event.save();
    res.status(201).json({ 
      success: true,
      message: 'Event created successfully', 
      data: event 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating event', 
      error: error.message 
    });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    // Find the event and user
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ 
        success: false,
        message: 'Event or user not found' 
      });
    }

    // Check if already registered using the Registration model
    const existingRegistration = await Registration.findOne({ 
      userId: userId, 
      eventId: eventId 
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        message: 'Already registered for this event' 
      });
    }

    const qrData = {
      userId: user._id,
      eventId: event._id,
      timestamp: Date.now()
    };

    const qrCode = await generateQRCode(qrData);

    // Create a new registration document
    const registration = new Registration({
      userId: userId,
      eventId: eventId,
      qrCode: qrCode,
      checkedIn: false
    });

    // Save the registration
    await registration.save();

    // Update the event's attendees array for backward compatibility
    event.attendees.push({ user: user._id, qrCode });
    await event.save();

    // Update the user's registered events
    await User.findByIdAndUpdate(user._id, {
      $push: { registeredEvents: event._id }
    });

    // Send confirmation email
    await sendEventRegistrationEmail(user.email, user.name, event, qrCode);

    res.json({ 
      success: true,
      message: 'Registered successfully', 
      data: { qrCode, registration } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering for event', 
      error: error.message 
    });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    // Find the registration
    const registration = await Registration.findOne({ 
      userId: userId,
      eventId: eventId
    });

    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked in' 
      });
    }

    // Update the registration
    registration.checkedIn = true;
    await registration.save();

    // Also update the event document for backward compatibility
    const event = await Event.findById(eventId);
    if (event) {
      const attendee = event.attendees.find(a => a.user.toString() === userId);
      if (attendee) {
        attendee.checkedIn = true;
        await event.save();
      }
    }

    res.json({ 
      success: true,
      message: 'Check-in successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Check-in error', 
      error: error.message 
    });
  }
};

export const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get all registrations for this event
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email studentId');

    if (!registrations) {
      return res.status(404).json({ 
        success: false,
        message: 'No registrations found' 
      });
    }

    res.json({
      success: true,
      message: 'Attendees retrieved successfully',
      data: {
        totalAttendees: registrations.length,
        checkedIn: registrations.filter(r => r.checkedIn).length,
        attendees: registrations.map(r => ({
          _id: r._id,
          user: r.userId,
          checkedIn: r.checkedIn,
          qrCode: r.qrCode,
          registeredAt: r.registeredAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching attendees', 
      error: error.message 
    });
  }
};