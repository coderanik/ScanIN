import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // Add this import

// Load environment variables
dotenv.config();

// For debugging - remove in production
console.log('Email credentials check:');
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

// Create transporter with additional error handling
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Set this to your actual email service
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export const sendEventRegistrationEmail = async (to, userName, event, qrCode) => {
  // Validate required parameters
  if (!to || !userName || !event) {
    throw new Error('Missing required parameters for sending email');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Event Registration Confirmation: ${event.title}`,
      html: `
        <h2>Event Registration Confirmation</h2>
        <p>Hello ${userName},</p>
        <p>You have successfully registered for: <strong>${event.title}</strong></p>
        <ul>
          <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
          <li>Time: ${event.time}</li>
          <li>Location: ${event.location}</li>
        </ul>
        <p>QR Code (for check-in):</p>
        <img src="${qrCode}" alt="QR Code" />
        <p>Thank you!</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};