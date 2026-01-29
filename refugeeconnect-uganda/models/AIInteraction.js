// models/AIInteraction.js
const mongoose = require("mongoose");

const aiInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionId: String,
  query: { type: String, required: true },
  response: { type: String, required: true },
  language: { type: String, default: "en" },
  context: String,
  confidence: Number,
  sources: [
    {
      title: String,
      url: String,
      type: String,
    },
  ],
  feedback: {
    helpful: Boolean,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  processingTime: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIInteraction", aiInteractionSchema);
