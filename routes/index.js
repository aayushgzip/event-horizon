const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/events');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 1000000 } // 1MB limit
});

// Home page - Display all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.render('index', { 
      title: 'Event Horizon - Upcoming Events',
      events
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display create event form
router.get('/create', (req, res) => {
  res.render('create-event', { title: 'Create New Event' });
});

// Process create event form
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, location, capacity } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      capacity: parseInt(capacity, 10)
    });
    
    if (req.file) {
      newEvent.image = req.file.filename;
    }
    
    await newEvent.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;