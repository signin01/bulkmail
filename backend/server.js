const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Specialized CORS for Vercel deployment
app.use(cors({
    origin: ["https://bulkmail-weld-seven.vercel.app"],
    methods: ["POST", "GET", "DELETE"],
    credentials: true
}));
app.use(express.json());

// MongoDB Schema
const MailSchema = new mongoose.Schema({
    subject: String,
    body: String,
    recipients: [String],
    sentAt: { type: Date, default: Date.now }
});
const Mail = mongoose.model('Mail', MailSchema);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('NEBULA_DB: Connected to Cluster1'))
    .catch(err => console.error('NEBULA_DB: Connection Failed', err));

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ROUTES
app.post('/api/send-mail', async (req, res) => {
    try {
        const { subject, body, recipients } = req.body;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipients.join(','),
            subject,
            text: body
        });
        const log = new Mail({ subject, body, recipients });
        await log.save();
        res.status(200).json({ message: 'Broadcast Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const logs = await Mail.find().sort({ sentAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Log retrieval failed' });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    try {
        await Mail.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry wiped' });
    } catch (err) {
        res.status(500).json({ error: 'Wipe failed' });
    }
});

// CRITICAL FOR VERCEL:
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
}

module.exports = app;