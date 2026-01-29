// routes/index.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Information = require("../models/Information");
const User = require("../models/User");

// Public homepage
router.get("/", async (req, res) => {
  try {
    // Get latest public information
    const latestInfo = await Information.find({
      targetAudience: { $in: ["all"] },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("createdBy", "firstName lastName");

    const urgentInfo = await Information.find({
      priority: "urgent",
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("createdBy", "firstName lastName");

    res.render("pages/index", {
      title: "RefugeeConnect Uganda - Home",
      latestInfo,
      urgentInfo,
      breadcrumbs: [{ name: "Home", url: "/" }],
    });
  } catch (error) {
    console.error("Homepage error:", error);
    res.render("pages/index", {
      title: "RefugeeConnect Uganda",
      latestInfo: [],
      urgentInfo: [],
      error: "Unable to load latest information",
    });
  }
});

// Dashboard (protected)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = req.session.user;

    // Get personalized information
    const personalizedInfo = await Information.find({
      $or: [
        { targetAudience: { $in: [user.refugeeStatus, "all"] } },
        { "location.districts": user.location?.district },
      ],
      isActive: true,
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .populate("createdBy", "firstName lastName");

    // Get user's recent AI interactions
    const AIInteraction = require("../models/AIInteraction");
    const recentInteractions = await AIInteraction.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(5);

    res.render("pages/dashboard", {
      title: "Dashboard - RefugeeConnect",
      user,
      personalizedInfo,
      recentInteractions,
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.redirect("/?error=dashboard_error");
  }
});

// AI Assistant page
router.get("/ai-assistant", authMiddleware, (req, res) => {
  res.render("pages/ai-assistant", {
    title: "AI Assistant - RefugeeConnect",
    pageScript: "ai-assistant.js",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "AI Assistant", url: "/ai-assistant" },
    ],
  });
});

// Information Hub
router.get("/information", async (req, res) => {
  try {
    const { category, search, language } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const information = await Information.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "firstName lastName");

    const total = await Information.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const categories = [
      "registration",
      "legal_rights",
      "healthcare",
      "education",
      "employment",
      "housing",
      "emergency",
      "community",
      "services",
    ];

    res.render("pages/information", {
      title: "Information Hub - RefugeeConnect",
      information,
      categories,
      currentCategory: category,
      currentSearch: search,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Information Hub", url: "/information" },
      ],
    });
  } catch (error) {
    console.error("Information page error:", error);
    res.render("pages/information", {
      information: [],
      categories: [],
      error: "Unable to load information",
    });
  }
});

// Information detail page
router.get("/information/:id", async (req, res) => {
  try {
    const info = await Information.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName",
    );

    if (!info || !info.isActive) {
      return res.status(404).render("pages/error", {
        title: "Not found",
        error: { status: 404, message: "Information not found" },
      });
    }

    // Increment views (best-effort)
    try {
      info.views = (info.views || 0) + 1;
      await info.save();
    } catch (_) {
      // ignore
    }

    res.render("pages/information-detail", {
      title: "Information - RefugeeConnect",
      info,
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Information Hub", url: "/information" },
        { name: "Details", url: `/information/${info._id}` },
      ],
    });
  } catch (error) {
    console.error("Information detail error:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      error: { status: 500, message: "Unable to load information details" },
    });
  }
});

// Services directory
router.get("/services", authMiddleware, (req, res) => {
  res.render("pages/services", {
    title: "Services - RefugeeConnect",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
    ],
  });
});

// Community page
router.get("/community", authMiddleware, (req, res) => {
  res.render("pages/community", {
    title: "Community - RefugeeConnect",
    pageScript: "community.js",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Community", url: "/community" },
    ],
  });
});

// Profile page
router.get("/profile", authMiddleware, (req, res) => {
  res.render("pages/profile", {
    title: "My Profile - RefugeeConnect",
    pageScript: "profile.js",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Profile", url: "/profile" },
    ],
  });
});

module.exports = router;
