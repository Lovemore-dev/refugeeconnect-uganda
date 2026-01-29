// routes/emergency.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Emergency contacts
const emergencyContacts = [
  {
    name: 'Police Emergency',
    number: '999',
    type: 'police',
    available: '24/7',
  },
  {
    name: 'Medical Emergency',
    number: '911',
    type: 'medical',
    available: '24/7',
  },
  {
    name: 'UNHCR Emergency',
    number: '+256-XXX-XXXX',
    type: 'unhcr',
    available: '24/7',
  },
  {
    name: 'Fire Department',
    number: '112',
    type: 'fire',
    available: '24/7',
  },
];

// Get emergency contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      contacts: emergencyContacts,
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      error: 'Failed to load emergency contacts',
    });
  }
});

// Report emergency
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const { type, description, location, urgency } = req.body;
    
    // In a real app, this would save to database and notify authorities
    console.log('Emergency reported:', {
      type,
      description,
      location,
      urgency,
      reportedBy: req.session.user._id,
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      message: 'Emergency report submitted successfully',
      reportId: Date.now().toString(),
    });
  } catch (error) {
    console.error('Report emergency error:', error);
    res.status(500).json({
      error: 'Failed to submit emergency report',
    });
  }
});

module.exports = router;
