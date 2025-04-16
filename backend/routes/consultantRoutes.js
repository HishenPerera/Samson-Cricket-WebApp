const express = require('express');
const router = express.Router();
const consultantController = require('../controllers/consultantController');

// Get all consultants
router.get('/', consultantController.getConsultants);

// Get consultant by ID
router.get('/:id', consultantController.getConsultantById);

// Create new consultant
router.post('/', consultantController.createConsultant);

// Update consultant
router.put('/:id', consultantController.updateConsultant);

// Delete consultant
router.delete('/:id', consultantController.deleteConsultant);

// Book a session with consultant
router.post('/:id/book-session', consultantController.bookSession);

// Session management routes
router.patch('/sessions/:sessionId/accept', consultantController.acceptSession);
router.patch('/sessions/:sessionId/reject', consultantController.rejectSession);
router.patch('/sessions/:sessionId/complete', consultantController.completeSession);
router.delete('/sessions/:sessionId', consultantController.deleteSession);
router.put('/sessions/:sessionId', consultantController.updateSession);

module.exports = router;