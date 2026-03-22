const mongoose = require('mongoose');

const MailSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: { type: [String], required: true },
    status: { type: String, default: 'Delivered' },
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mail', MailSchema);