const express = require('express');
const Monitor = require('../models/Monitor');
const Incident = require('../models/Incident');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Create a monitor
router.post('/', auth, async (req, res) => {
    try {
        let { url, name, type, interval } = req.body;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        const monitor = await Monitor.create({ userId: req.user.userId, url, name, type, interval });
        res.status(201).json(monitor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all monitors for user
router.get('/', auth, async (req, res) => {
    try {
        const monitors = await Monitor.find({ userId: req.user.userId }).lean();
        
        // Attach latest incident for UI duration calculations
        for (let i = 0; i < monitors.length; i++) {
            const latestIncident = await Incident.findOne({ monitorId: monitors[i]._id }).sort({ createdAt: -1 }).lean();
            if (latestIncident) {
                monitors[i].latestIncident = latestIncident;
            }
        }
        
        res.json(monitors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get incidents for a monitor
router.get('/:id/incidents', auth, async (req, res) => {
    try {
        const incidents = await Incident.find({ monitorId: req.params.id }).sort({ createdAt: -1 });
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a monitor
router.delete('/:id', auth, async (req, res) => {
    try {
        await Monitor.findByIdAndDelete(req.params.id);
        await Incident.deleteMany({ monitorId: req.params.id }); 
        res.json({ message: 'Monitor deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
