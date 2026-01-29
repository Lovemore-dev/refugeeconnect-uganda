// routes/community.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Mock community data (in real app, this would come from database)
let communityMessages = [];
let communityGroups = [
  {
    id: 1,
    name: 'Kampala Refugee Community',
    description: 'Community for refugees in Kampala',
    members: 150,
    location: 'Kampala',
  },
  {
    id: 2,
    name: 'Education Support Group',
    description: 'Sharing educational resources and opportunities',
    members: 75,
    location: 'Nationwide',
  },
];

// Get community groups
router.get('/groups', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      groups: communityGroups,
    });
  } catch (error) {
    console.error('Get community groups error:', error);
    res.status(500).json({
      error: 'Failed to load community groups',
    });
  }
});

// Join community group
router.post('/groups/:groupId/join', authMiddleware, async (req, res) => {
  try {
    const group = communityGroups.find(g => g.id === parseInt(req.params.groupId));
    
    if (!group) {
      return res.status(404).json({
        error: 'Community group not found',
      });
    }
    
    group.members += 1;
    
    res.json({
      success: true,
      message: 'Successfully joined community group',
      group,
    });
  } catch (error) {
    console.error('Join community group error:', error);
    res.status(500).json({
      error: 'Failed to join community group',
    });
  }
});

// Get community messages
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const { groupId, limit = 50 } = req.query;
    
    let messages = communityMessages;
    
    if (groupId) {
      messages = messages.filter(m => m.groupId === parseInt(groupId));
    }
    
    messages = messages.slice(-parseInt(limit));
    
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Get community messages error:', error);
    res.status(500).json({
      error: 'Failed to load community messages',
    });
  }
});

// Post community message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { groupId, message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }
    
    const newMessage = {
      id: Date.now(),
      groupId: parseInt(groupId) || null,
      userId: req.session.user._id,
      userName: `${req.session.user.firstName} ${req.session.user.lastName}`,
      message: message.trim(),
      timestamp: new Date(),
    };
    
    communityMessages.push(newMessage);
    
    res.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Post community message error:', error);
    res.status(500).json({
      error: 'Failed to post message',
    });
  }
});

module.exports = router;
