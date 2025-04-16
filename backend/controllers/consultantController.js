const Consultant = require('../models/consultantModel');

// Get all consultants
exports.getConsultants = async (req, res) => {
    const consultants = await Consultant.find();
    if (!consultants) {
        return res.status(404).json({ message: "Consultants not found" });
    }
    res.status(200).json(consultants);
};

// Get consultant by ID
exports.getConsultantById = async (req, res) => {
    try {
        const consultant = await Consultant.findById(req.params.id);
        if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
        }
        res.status(200).json(consultant);
    } catch (error) {
        res.status(500).json({ message: "Error fetching consultant", error: error.message });
    }
};

// Create new consultant
exports.createConsultant = async (req, res) => {
    try {
        const { firstName, lastName, email, type, availableTimes } = req.body;
        
        const newConsultant = new Consultant({
            firstName,
            lastName,
            email,
            type,
            availableTimes,
            sessions: []
        });
        
        const savedConsultant = await newConsultant.save();
        res.status(201).json(savedConsultant);
    } catch (error) {
        res.status(400).json({ message: "Error creating consultant", error: error.message });
    }
};

// Update consultant
exports.updateConsultant = async (req, res) => {
    try {
        const { firstName, lastName, email, type, availableTimes } = req.body;
        
        const updatedConsultant = await Consultant.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, type, availableTimes },
            { new: true, runValidators: true }
        );
        
        if (!updatedConsultant) {
            return res.status(404).json({ message: "Consultant not found" });
        }
        
        res.status(200).json(updatedConsultant);
    } catch (error) {
        res.status(400).json({ message: "Error updating consultant", error: error.message });
    }
};

// Delete consultant
exports.deleteConsultant = async (req, res) => {
    try {
        const consultant = await Consultant.findByIdAndDelete(req.params.id);
        
        if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
        }
        
        res.status(200).json({ message: "Consultant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting consultant", error: error.message });
    }
};

// Book session with consultant
exports.bookSession = async (req, res) => {
    try {
        const { userId, userEmail, userContact, sessionDate, sessionTime, sessionDuration } = req.body;
        
        // Validate required fields
        if (!userId || !userEmail || !userContact || !sessionDate || !sessionTime || !sessionDuration) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const consultant = await Consultant.findById(req.params.id);
        if (!consultant) {
            return res.status(404).json({ message: "Consultant not found" });
        }
        
        const newSession = {
            userId,
            userEmail,
            userContact,
            status: 'pending',
            sessionDate,
            sessionTime,
            sessionDuration
        };
        
        consultant.sessions.push(newSession);
        await consultant.save();
        
        res.status(201).json(consultant);
    } catch (error) {
        res.status(400).json({ message: "Error booking session", error: error.message });
    }
};

// Accept session
exports.acceptSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const consultant = await Consultant.findOne({
            "sessions._id": sessionId
        });
        
        if (!consultant) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        const session = consultant.sessions.id(sessionId);
        session.status = 'confirmed';
        
        await consultant.save();
        
        res.status(200).json({ message: "Session confirmed successfully", consultant });
    } catch (error) {
        res.status(400).json({ message: "Error accepting session", error: error.message });
    }
};

// Reject session
exports.rejectSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const consultant = await Consultant.findOne({
            "sessions._id": sessionId
        });
        
        if (!consultant) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        const session = consultant.sessions.id(sessionId);
        session.status = 'cancelled';
        
        await consultant.save();
        
        res.status(200).json({ message: "Session cancelled successfully", consultant });
    } catch (error) {
        res.status(400).json({ message: "Error rejecting session", error: error.message });
    }
};

// Complete session
exports.completeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const consultant = await Consultant.findOne({
            "sessions._id": sessionId
        });
        
        if (!consultant) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        const session = consultant.sessions.id(sessionId);
        if (session.status !== 'confirmed') {
            return res.status(400).json({ message: "Only confirmed sessions can be completed" });
        }
        
        session.status = 'completed';
        
        await consultant.save();
        
        res.status(200).json({ message: "Session completed successfully", consultant });
    } catch (error) {
        res.status(400).json({ message: "Error completing session", error: error.message });
    }
};

// Delete session
exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const consultant = await Consultant.findOne({
            "sessions._id": sessionId
        });
        
        if (!consultant) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        consultant.sessions.pull(sessionId);
        await consultant.save();
        
        res.status(200).json({ message: "Session deleted successfully", consultant });
    } catch (error) {
        res.status(400).json({ message: "Error deleting session", error: error.message });
    }
};

// Update session
exports.updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { sessionDate, sessionTime, sessionDuration, status, userEmail, userContact } = req.body;
        
        const consultant = await Consultant.findOne({
            "sessions._id": sessionId
        });
        
        if (!consultant) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        const session = consultant.sessions.id(sessionId);
        
        if (sessionDate) session.sessionDate = sessionDate;
        if (sessionTime) session.sessionTime = sessionTime;
        if (sessionDuration) session.sessionDuration = sessionDuration;
        if (userEmail) session.userEmail = userEmail;
        if (userContact) session.userContact = userContact;
        if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            session.status = status;
        }
        
        await consultant.save();
        
        res.status(200).json({ message: "Session updated successfully", consultant });
    } catch (error) {
        res.status(400).json({ message: "Error updating session", error: error.message });
    }
};

