// routes/services.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Mock services data (in real app, this would come from database)
const services = [
  {
    id: 1,
    name: 'UNHCR Registration',
    category: 'registration',
    description: 'Assistance with refugee registration and documentation',
    location: 'Kampala',
    contact: '+256-XXX-XXXX',
    website: 'https://www.unhcr.org',
  },
  {
    id: 2,
    name: 'Medical Services',
    category: 'healthcare',
    description: 'Primary healthcare services for refugees',
    location: 'Multiple locations',
    contact: '+256-XXX-XXXX',
  },
  {
    id: 3,
    name: 'Education Support',
    category: 'education',
    description: 'School enrollment and educational support',
    location: 'Various settlements',
    contact: '+256-XXX-XXXX',
  },
];

// Get all services
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filteredServices = services;
    
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      services: filteredServices,
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      error: 'Failed to load services',
    });
  }
});

// Get service by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const service = services.find(s => s.id === parseInt(req.params.id));
    
    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
      });
    }
    
    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      error: 'Failed to load service',
    });
  }
});

module.exports = router;
