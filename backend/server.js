const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Nebula DB Connected"))
  .catch(err => console.log("DB Connection Error:", err));

// Schema
const MailSchema = new mongoose.Schema({
  subject: String,
  body: String,
  recipients: [String],
  sentAt: { type: Date, default: Date.now }
});
const Mail = mongoose.model('Mail', MailSchema);

// Email Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.get('/api/history', async (req, res) => {
  const logs = await Mail.find().sort({ sentAt: -1 });
  res.json(logs);
});

app.post('/api/send-mail', async (req, res) => {
  const { subject, body, recipients } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(','),
      subject,
      text: body
    });
    const newMail = new Mail({ subject, body, recipients });
    await newMail.save();
    res.json({ msg: "Sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  await Mail.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// Export for Vercel
module.exports = app;