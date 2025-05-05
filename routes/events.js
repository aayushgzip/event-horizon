const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Display registration form for an event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).send('Event not found');
    }
    
    res.render('register', {
      title: `Register for ${event.title}`,
      event
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Process registration form
router.post('/register', async (req, res) => {
  try {
    const { eventId, fullName, email } = req.body;
    
    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).send('Event not found');
    }
    
    // Check if event is full
    if (event.registered >= event.capacity) {
      return res.status(400).render('register', {
        title: `Register for ${event.title}`,
        event,
        error: 'Sorry, this event is already full'
      });
    }
    
    // Create registration
    const registration = new Registration({
      eventId,
      fullName,
      email
    });
    
    await registration.save();
    
    // Update event registration count
    event.registered += 1;
    await event.save();
    
    res.redirect('/?success=true');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;