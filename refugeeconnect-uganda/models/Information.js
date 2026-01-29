// models/Information.js
const mongoose = require("mongoose");

const informationSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    sw: String,
    lg: String,
    ac: String,
    teo: String,
    lgg: String,
    rw: String,
    ar: String,
  },
  content: {
    en: { type: String, required: true },
    sw: String,
    lg: String,
    ac: String,
    teo: String,
    lgg: String,
    rw: String,
    ar: String,
  },
  category: {
    type: String,
    enum: [
      "registration",
      "legal_rights",
      "healthcare",
      "education",
      "employment",
      "housing",
      "emergency",
      "community",
      "services",
    ],
    required: true,
  },
  targetAudience: [
    {
      type: String,
      enum: ["asylum_seeker", "refugee", "returnee", "local_community", "all"],
    },
  ],
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  location: {
    districts: [String],
    settlements: [String],
    isNational: { type: Boolean, default: false },
  },
  media: [
    {
      type: { type: String, enum: ["image", "video", "audio", "document"] },
      url: String,
      caption: String,
      language: String,
    },
  ],
  contacts: [
    {
      organization: String,
      phone: String,
      email: String,
      address: String,
      hours: String,
    },
  ],
  tags: [String],
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
});

informationSchema.index({
  "title.en": "text",
  "content.en": "text",
  tags: "text",
});
informationSchema.index({ category: 1, priority: 1, createdAt: -1 });
informationSchema.index({ location: 1, targetAudience: 1 });

module.exports = mongoose.model("Information", informationSchema);
