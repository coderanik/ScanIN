import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      createdBy: req.user._id,
    });
    await event.save();
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating event',
      error: err.message 
    });
  }
};

export const getAttendees = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('userId', 'name email studentId');
    
    res.json({ 
      success: true,
      message: 'Attendees retrieved successfully',
      data: registrations
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching attendees',
      error: err.message 
    });
  }
};

export const checkInUser = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const registration = await Registration.findOne({ userId, eventId });
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }

    registration.checkedIn = true;
    await registration.save();

    res.json({ 
      success: true,
      message: 'Check-in successful' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking in user',
      error: err.message 
    });
  }
};

export const exportAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email studentId');

    // Get attendance records for this event
    const attendanceRecords = await Attendance.find({ eventId });

    // Create comprehensive export data
    const exportData = registrations.map(registration => {
      const attendance = attendanceRecords.find(att => att.email === registration.userId.email);
      return {
        name: registration.userId.name,
        email: registration.userId.email,
        studentId: registration.userId.studentId,
        registeredAt: registration.registeredAt,
        checkedIn: registration.checkedIn,
        checkInTime: attendance ? attendance.timeOfAttendance : null,
        qrCode: registration.qrCode
      };
    });

    res.json({
      success: true,
      message: 'Export data retrieved successfully',
      data: {
        event: {
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time
        },
        totalRegistered: exportData.length,
        totalCheckedIn: exportData.filter(item => item.checkedIn).length,
        attendees: exportData
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error exporting attendees',
      error: err.message 
    });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrCode, eventId } = req.body;
    
    // Parse the QR code data
    let qrData;
    try {
      qrData = JSON.parse(qrCode);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid QR code format' 
      });
    }

    const { userId, eventId: qrEventId, timestamp } = qrData;

    // Validate the data
    if (!userId || !qrEventId) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid QR code data' 
      });
    }

    // Check if the event exists and matches
    const event = await Event.findById(qrEventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    if (qrEventId !== eventId) {
      return res.status(400).json({ 
        success: false,
        message: 'QR code is for a different event' 
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if the user is registered for this event
    const registration = await Registration.findOne({ userId, eventId: qrEventId });
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'User is not registered for this event' 
      });
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return res.status(400).json({ 
        success: false,
        message: 'User already checked in',
        data: {
          user: {
            name: user.name,
            email: user.email,
            studentId: user.studentId
          }
        }
      });
    }

    // Mark as checked in
    registration.checkedIn = true;
    await registration.save();

    // Create or update attendance record
    let attendance = await Attendance.findOne({ eventId: qrEventId, email: user.email });
    
    if (!attendance) {
      attendance = new Attendance({
        eventId: qrEventId,
        participantName: user.name,
        email: user.email,
        qrCode: registration.qrCode,
        timeOfAttendance: new Date()
      });
    } else {
      attendance.timeOfAttendance = new Date();
    }
    
    await attendance.save();

    // Also update the event document for backward compatibility
    const eventAttendee = event.attendees.find(a => a.user.toString() === userId);
    if (eventAttendee) {
      eventAttendee.checkedIn = true;
      await event.save();
    }

    res.json({ 
      success: true,
      message: 'Check-in successful',
      data: {
        user: {
          name: user.name,
          email: user.email,
          studentId: user.studentId
        },
        event: {
          title: event.title,
          location: event.location,
          date: event.date,
          time: event.time
        },
        checkInTime: new Date()
      }
    });

  } catch (err) {
    console.error('QR scan error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error scanning QR code',
      error: err.message 
    });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email studentId');

    // Get attendance records for this event
    const attendanceRecords = await Attendance.find({ eventId });

    // Calculate statistics
    const totalRegistered = registrations.length;
    const totalCheckedIn = registrations.filter(r => r.checkedIn).length;
    const checkInRate = totalRegistered > 0 ? (totalCheckedIn / totalRegistered) * 100 : 0;

    // Get recent check-ins (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCheckIns = attendanceRecords.filter(att => 
      new Date(att.timeOfAttendance) > last24Hours
    ).length;

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        event: {
          title: event.title,
          date: event.date,
          time: event.time
        },
        totalRegistered,
        totalCheckedIn,
        checkInRate: Math.round(checkInRate * 100) / 100,
        recentCheckIns,
        registrations: registrations.map(r => ({
          user: r.userId,
          checkedIn: r.checkedIn,
          registeredAt: r.registeredAt
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics',
      error: err.message 
    });
  }
};
