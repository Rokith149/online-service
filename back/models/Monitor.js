const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'HTTP' }, // HTTP/HTTPS
    status: { type: String, enum: ['UP', 'DOWN', 'PENDING'], default: 'PENDING' },
    lastChecked: { type: Date },
    interval: { type: Number, default: 5 }, // Minutes
    pingHistory: [{
        time: { type: Date },
        ms: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Monitor', monitorSchema);
