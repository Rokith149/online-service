// back/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/monitors', require('./routes/monitorRoutes'));

// Root endpoint
app.get('/', (req, res) => {
    res.send('Uptime API is running!');
});

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uptime_tracker')
    .then(() => {
        console.log('MongoDB connected');
        // Start ping service
        require('./services/pingService');
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Always listen so Render doesn't kill the container!
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
