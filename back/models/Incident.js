const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    monitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true },
    type: { type: String, enum: ['DOWN', 'UP'], required: true },
    cause: { type: String }, // Error message if down
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
