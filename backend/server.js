const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const MailSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: { type: [String], required: true },
    sentAt: { type: Date, default: Date.now }
});

const Mail = mongoose.model('Mail', MailSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('SYSTEM: MongoDB Cluster1 Synchronized'))
    .catch(err => console.error('CRITICAL: Database Connection Interrupted', err));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/send-mail', async (req, res) => {
    const { subject, body, recipients } = req.body;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipients.join(','),
            subject: subject,
            text: body
        };

        await transporter.sendMail(mailOptions);

        const newEntry = new Mail({
            subject,
            body,
            recipients
        });

        await newEntry.save();
        res.status(200).json({ status: 'Success', message: 'Payload Delivered' });
        
    } catch (error) {
        console.error('TRANSMISSION_ERROR:', error);
        res.status(500).json({ status: 'Error', message: 'Broadcast Failed' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const logs = await Mail.find().sort({ sentAt: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ status: 'Error', message: 'Could not retrieve logs' });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    try {
        const result = await Mail.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.status(200).json({ message: 'Log entry wiped' });
    } catch (err) {
        res.status(500).json({ status: 'Error', message: 'Wipe protocol failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`NEBULA SERVER ACTIVE ON PORT ${PORT}`);
});