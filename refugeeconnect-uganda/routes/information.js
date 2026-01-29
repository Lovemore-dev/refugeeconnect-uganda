// routes/information.js
const express = require("express");
const router = express.Router();
const Information = require("../models/Information");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/information/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|wav|mp4|webm/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Get all information (with filtering)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      language,
      priority,
      targetAudience,
      district,
      page = 1,
      limit = 12,
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Build query filters
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = { $in: [targetAudience, "all"] };
    if (district) query["location.districts"] = district;
    if (search) query.$text = { $search: search };

    const information = await Information.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    const total = await Information.countDocuments(query);

    res.json({
      success: true,
      information,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + information.length < total,
        hasPrev: page > 1,
      },
      filters: {
        category,
        search,
        language,
        priority,
        targetAudience,
        district,
      },
    });
  } catch (error) {
    console.error("Get information error:", error);
    res.status(500).json({
      error: "Failed to load information",
    });
  }
});

// Get single information item
router.get("/:id", async (req, res) => {
  try {
    const information = await Information.findById(req.params.id)
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!information || !information.isActive) {
      return res.status(404).json({
        error: "Information not found",
      });
    }

    // Increment view count
    information.views += 1;
    await information.save();

    res.json({
      success: true,
      information,
    });
  } catch (error) {
    console.error("Get information item error:", error);
    res.status(500).json({
      error: "Failed to load information",
    });
  }
});

// Create new information (protected)
router.post("/", authMiddleware, upload.array("media", 5), async (req, res) => {
  try {
    const userId = req.session.user._id;
    const {
      title,
      content,
      category,
      targetAudience,
      priority,
      districts,
      settlements,
      isNational,
      tags,
      contacts,
      expiresAt,
    } = req.body;

    // Parse JSON fields
    const titleObj = JSON.parse(title || "{}");
    const contentObj = JSON.parse(content || "{}");
    const targetAudienceArray = JSON.parse(targetAudience || '["all"]');
    const districtsArray = JSON.parse(districts || "[]");
    const settlementsArray = JSON.parse(settlements || "[]");
    const tagsArray = JSON.parse(tags || "[]");
    const contactsArray = JSON.parse(contacts || "[]");

    // Process uploaded files
    const mediaArray = [];
    if (req.files) {
      for (const file of req.files) {
        mediaArray.push({
          type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : file.mimetype.startsWith("audio/")
                ? "audio"
                : "document",
          url: `/uploads/information/${file.filename}`,
          caption: file.originalname,
        });
      }
    }

    const information = new Information({
      title: titleObj,
      content: contentObj,
      category,
      targetAudience: targetAudienceArray,
      priority: priority || "medium",
      location: {
        districts: districtsArray,
        settlements: settlementsArray,
        isNational: isNational === "true",
      },
      media: mediaArray,
      contacts: contactsArray,
      tags: tagsArray,
      createdBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await information.save();
    await information.populate("createdBy", "firstName lastName");

    res.json({
      success: true,
      information,
      message: "Information created successfully",
    });
  } catch (error) {
    console.error("Create information error:", error);
    res.status(500).json({
      error: "Failed to create information",
    });
  }
});

// Update information (protected)
router.put(
  "/:id",
  authMiddleware,
  upload.array("media", 5),
  async (req, res) => {
    try {
      const userId = req.session.user._id;
      const information = await Information.findById(req.params.id);

      if (!information) {
        return res.status(404).json({
          error: "Information not found",
        });
      }

      // Check if user can edit (creator or admin)
      if (
        information.createdBy.toString() !== userId &&
        !req.session.user.isAdmin
      ) {
        return res.status(403).json({
          error: "Access denied",
        });
      }

      // Update fields
      const updateData = { ...req.body };

      // Parse JSON fields if they exist
      if (updateData.title) updateData.title = JSON.parse(updateData.title);
      if (updateData.content)
        updateData.content = JSON.parse(updateData.content);
      if (updateData.targetAudience)
        updateData.targetAudience = JSON.parse(updateData.targetAudience);
      if (updateData.districts)
        updateData.location = {
          ...information.location,
          districts: JSON.parse(updateData.districts),
        };
      if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
      if (updateData.contacts)
        updateData.contacts = JSON.parse(updateData.contacts);

      updateData.updatedBy = userId;
      updateData.updatedAt = new Date();

      // Handle new media files
      if (req.files && req.files.length > 0) {
        const newMedia = req.files.map((file) => ({
          type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : file.mimetype.startsWith("audio/")
                ? "audio"
                : "document",
          url: `/uploads/information/${file.filename}`,
          caption: file.originalname,
        }));

        updateData.media = [...(information.media || []), ...newMedia];
      }

      const updatedInformation = await Information.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true },
      ).populate("createdBy updatedBy", "firstName lastName");

      res.json({
        success: true,
        information: updatedInformation,
        message: "Information updated successfully",
      });
    } catch (error) {
      console.error("Update information error:", error);
      res.status(500).json({
        error: "Failed to update information",
      });
    }
  },
);

// Delete information (protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const information = await Information.findById(req.params.id);

    if (!information) {
      return res.status(404).json({
        error: "Information not found",
      });
    }

    // Check if user can delete (creator or admin)
    if (
      information.createdBy.toString() !== userId &&
      !req.session.user.isAdmin
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    // Soft delete
    information.isActive = false;
    information.updatedBy = userId;
    information.updatedAt = new Date();
    await information.save();

    res.json({
      success: true,
      message: "Information deleted successfully",
    });
  } catch (error) {
    console.error("Delete information error:", error);
    res.status(500).json({
      error: "Failed to delete information",
    });
  }
});

// Like/unlike information
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const information = await Information.findById(req.params.id);

    if (!information || !information.isActive) {
      return res.status(404).json({
        error: "Information not found",
      });
    }

    const hasLiked = information.likes.includes(userId);

    if (hasLiked) {
      information.likes.pull(userId);
    } else {
      information.likes.push(userId);
    }

    await information.save();

    res.json({
      success: true,
      liked: !hasLiked,
      likesCount: information.likes.length,
    });
  } catch (error) {
    console.error("Like information error:", error);
    res.status(500).json({
      error: "Failed to update like status",
    });
  }
});

// Get information categories
router.get("/meta/categories", (req, res) => {
  const categories = [
    { value: "registration", label: "Refugee Registration" },
    { value: "legal_rights", label: "Legal Rights" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "employment", label: "Employment" },
    { value: "housing", label: "Housing" },
    { value: "emergency", label: "Emergency" },
    { value: "community", label: "Community" },
    { value: "services", label: "Services" },
  ];

  res.json({
    success: true,
    categories,
  });
});

module.exports = router;
