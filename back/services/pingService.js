const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Monitor = require('../models/Monitor');
const Incident = require('../models/Incident');
const User = require('../models/User');
const Alert = require('../models/Alert');

const pingService = async () => {
    try {
        const monitors = await Monitor.find({});
        
        for (const monitor of monitors) {
            try {
                const startTime = Date.now();
                await axios.get(monitor.url, { 
                    timeout: 10000,
                    validateStatus: function (status) {
                        return status >= 200 && status < 500; // Accept 4xx as UP (often auth prompts or forbidden paths from bots)
                    }
                });
                
                const ms = Date.now() - startTime;
                if (!monitor.pingHistory) monitor.pingHistory = [];
                monitor.pingHistory.push({ time: new Date(), ms });
                if (monitor.pingHistory.length > 60) {
                    monitor.pingHistory.shift();
                }

                // If successful
                if (monitor.status !== 'UP') {
                    handleStatusChange(monitor, 'UP');
                } else {
                    monitor.lastChecked = new Date();
                    await monitor.save();
                }
            } catch (error) {
                const ms = Date.now() - startTime;
                if (!monitor.pingHistory) monitor.pingHistory = [];
                monitor.pingHistory.push({ time: new Date(), ms });
                if (monitor.pingHistory.length > 60) {
                    monitor.pingHistory.shift();
                }

                if (monitor.status !== 'DOWN') {
                    handleStatusChange(monitor, 'DOWN', error.message);
                } else {
                    monitor.lastChecked = new Date();
                    await monitor.save();
                }
            }
        }
    } catch (err) {
        console.error('Error in ping service:', err);
    }
};

const handleStatusChange = async (monitor, newStatus, cause = '') => {
    const prevStatus = monitor.status;
    monitor.status = newStatus;
    monitor.lastChecked = new Date();
    await monitor.save();

    const user = await User.findById(monitor.userId);

    if (newStatus === 'DOWN') {
        // Create new incident
        await Incident.create({
            monitorId: monitor._id,
            type: 'DOWN',
            cause: cause || 'Service unavailable'
        });
        
        // Create alert
        await Alert.create({
            userId: monitor.userId,
            message: `Monitor ${monitor.name} (${monitor.url}) is DOWN.`
        });

        sendEmail(user.email, `Monitor is DOWN: ${monitor.name}`, `Your monitor ${monitor.name} (${monitor.url}) is currently down.\nCause: ${cause}`);

    } else if (newStatus === 'UP' && prevStatus === 'DOWN') {
        // Resolve incident
        const latestIncident = await Incident.findOne({ monitorId: monitor._id, resolvedAt: null }).sort({ createdAt: -1 });
        if (latestIncident) {
            latestIncident.resolvedAt = new Date();
            latestIncident.type = 'UP';
            await latestIncident.save();
        }

        // Create alert
        await Alert.create({
            userId: monitor.userId,
            message: `Monitor ${monitor.name} (${monitor.url}) is back UP.`
        });

        sendEmail(user.email, `Monitor is UP: ${monitor.name}`, `Your monitor ${monitor.name} (${monitor.url}) is back up and running.`);
    }
};

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your SMTP details
            auth: {
                user: process.env.EMAIL_USER || 'placeholder@gmail.com',
                pass: process.env.EMAIL_PASS || 'placeholder_pass',
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'placeholder@gmail.com',
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
        console.error('Error sending email:', err.message);
    }
};

// Run every minute
cron.schedule('* * * * *', pingService);

console.log('Ping service started (cron job running every minute).');

module.exports = { pingService, handleStatusChange };
