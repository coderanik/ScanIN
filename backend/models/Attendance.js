import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participantName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  timeOfAttendance: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries
attendanceSchema.index({ eventId: 1, email: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 