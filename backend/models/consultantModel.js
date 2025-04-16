const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
    },

    type: { 
        type: String, 
        required: true,
        enum: ['batting', 'bowling', 'fielding', 'physical']
    },

    availableTimes: { type: String, required: true },
    sessions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userEmail: { type: String, required: true },
        userContact: { type: String, required: true },
        status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
        sessionDate: { type: Date, required: true },
        sessionTime: { type: String, required: true },
        sessionDuration: { type: Number, required: true },
    }]
}, { timestamps: true });

const Consultant = mongoose.model('Consultant', consultantSchema);

module.exports = Consultant;