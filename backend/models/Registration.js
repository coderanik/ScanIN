import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Fixed field name from eventid to eventId
    qrCode: String, // Fixed field name from qrcode to qrCode
    checkedIn: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Create a compound index to prevent duplicate registrations
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);