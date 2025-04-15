const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Your database model

// Save event
router.post('/events/save', async (req, res) => {
    try {
        const { userId, event } = req.body;
        const newEvent = new Event({
            userId,
            ...event,
            createdAt: new Date()
        });
        await newEvent.save();
        res.json(newEvent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save event' });
    }
});

// Get user's events
router.get('/events/:userId', async (req, res) => {
    try {
        const events = await Event.find({ userId: req.params.userId });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load events' });
    }
});

// Add delete endpoint
router.delete('/events/delete', async (req, res) => {
    try {
        const { userId, eventId } = req.body;
        await Event.findOneAndDelete({ _id: eventId, userId: userId });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router; 