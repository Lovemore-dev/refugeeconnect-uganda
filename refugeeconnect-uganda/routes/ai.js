// routes/ai.js
const express = require("express");
const router = express.Router();
const AIService = require("../services/AIService");
const authMiddleware = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

// AI-specific rate limiting
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
  message: { error: "Too many AI requests, please wait before asking again." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

// Process AI query
router.post("/query", authMiddleware, async (req, res) => {
  try {
    const { message, language, context } = req.body;
    const userId = req.session.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: "Message is too long. Please limit to 1000 characters.",
      });
    }

    const aiService = new AIService();
    const response = await aiService.processQuery(
      message.trim(),
      language || req.session.user.preferredLanguage || "en",
      userId,
    );

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("AI query error:", error);
    res.status(500).json({
      error: "Failed to process your request. Please try again.",
      timestamp: new Date(),
    });
  }
});

// Get AI interaction history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const AIInteraction = require("../models/AIInteraction");

    const interactions = await AIInteraction.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select("query response language confidence timestamp sources feedback");

    const total = await AIInteraction.countDocuments({ userId });

    res.json({
      success: true,
      interactions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + interactions.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("AI history error:", error);
    res.status(500).json({
      error: "Failed to load interaction history",
    });
  }
});

// Submit feedback for AI response
router.post("/feedback/:interactionId", authMiddleware, async (req, res) => {
  try {
    const { interactionId } = req.params;
    const { helpful, rating, comment } = req.body;
    const userId = req.session.user._id;

    const AIInteraction = require("../models/AIInteraction");

    const interaction = await AIInteraction.findOne({
      _id: interactionId,
      userId,
    });

    if (!interaction) {
      return res.status(404).json({
        error: "Interaction not found",
      });
    }

    interaction.feedback = {
      helpful: helpful === true || helpful === "true",
      rating: rating ? parseInt(rating) : null,
      comment: comment || "",
    };

    await interaction.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("AI feedback error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
    });
  }
});

// Get AI analytics (for admin users)
router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin role to user model)
    if (!req.session.user.isAdmin) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const AIInteraction = require("../models/AIInteraction");

    const analytics = await AIInteraction.aggregate([
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          averageConfidence: { $avg: "$confidence" },
          averageProcessingTime: { $avg: "$processingTime" },
          languageDistribution: {
            $push: "$language",
          },
        },
      },
    ]);

    const recentInteractions = await AIInteraction.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("userId", "firstName lastName refugeeStatus");

    res.json({
      success: true,
      analytics: analytics[0] || {},
      recentInteractions,
    });
  } catch (error) {
    console.error("AI analytics error:", error);
    res.status(500).json({
      error: "Failed to load analytics",
    });
  }
});

// Clear user's AI history
router.delete("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user._id;

    const AIInteraction = require("../models/AIInteraction");
    await AIInteraction.deleteMany({ userId });

    res.json({
      success: true,
      message: "AI history cleared successfully",
    });
  } catch (error) {
    console.error("Clear AI history error:", error);
    res.status(500).json({
      error: "Failed to clear history",
    });
  }
});

module.exports = router;
