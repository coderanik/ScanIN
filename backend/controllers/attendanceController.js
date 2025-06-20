import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// Generate QR Code for an event
export const generateEventQR = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate QR code with the check-in URL
    const checkInUrl = `${process.env.FRONTEND_URL}/check-in/${eventId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);

    // Update event with QR code URL
    event.qrCodeUrl = qrCodeDataUrl;
    await event.save();

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record attendance when QR code is scanned
export const recordAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantName, email } = req.body;

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found or inactive' });
    }

    // Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      eventId,
      email
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded' });
    }

    // Create new attendance record
    const attendance = new Attendance({
      eventId,
      participantName,
      email,
      qrCode: event.qrCodeUrl
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export attendance data to Excel
export const exportAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all attendance records for the event (manual check-ins)
    const manualAttendanceRecords = await Attendance.find({ eventId })
      .sort({ timeOfAttendance: 1 });

    // Get all registrations for this event (QR code check-ins)
    const registrations = await Registration.find({ eventId, checkedIn: true })
      .populate('userId', 'name email studentId')
      .sort({ updatedAt: 1 });

    // Create new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add headers
    worksheet.columns = [
      { header: 'Participant Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Student ID', key: 'studentId', width: 20 },
      { header: 'Check-in Method', key: 'method', width: 15 },
      { header: 'Time of Attendance', key: 'time', width: 30 },
      { header: 'QR Code', key: 'qrCode', width: 50 }
    ];

    // Add manual attendance records
    manualAttendanceRecords.forEach(record => {
      worksheet.addRow({
        name: record.participantName,
        email: record.email,
        studentId: 'N/A',
        method: 'Manual',
        time: record.timeOfAttendance.toLocaleString(),
        qrCode: record.qrCode || 'N/A'
      });
    });

    // Add QR code scanned attendance records
    registrations.forEach(registration => {
      // Check if this user already has a manual attendance record
      const existingManualRecord = manualAttendanceRecords.find(
        record => record.email === registration.userId.email
      );
      
      if (!existingManualRecord) {
        worksheet.addRow({
          name: registration.userId.name,
          email: registration.userId.email,
          studentId: registration.userId.studentId,
          method: 'QR Code',
          time: registration.updatedAt.toLocaleString(),
          qrCode: registration.qrCode || 'N/A'
        });
      }
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add summary information
    worksheet.addRow([]); // Empty row
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Manual Check-ins', manualAttendanceRecords.length]);
    worksheet.addRow(['Total QR Code Check-ins', registrations.length]);
    worksheet.addRow(['Total Check-ins', manualAttendanceRecords.length + registrations.length]);

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${event.title}-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 