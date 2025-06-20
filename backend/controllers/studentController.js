import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const registrations = await Registration.find({ userId })
      .populate('eventId');
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
}; 