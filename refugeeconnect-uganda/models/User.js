// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  preferredLanguage: {
    type: String,
    enum: ["en", "sw", "lg", "ac", "teo", "lgg", "rw", "ar"],
    default: "en",
  },
  refugeeStatus: {
    type: String,
    enum: ["asylum_seeker", "refugee", "returnee", "local_community"],
    required: true,
  },
  location: {
    district: String,
    settlement: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  demographics: {
    age: Number,
    gender: String,
    nationality: String,
    familySize: Number,
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    accessibility: {
      textSize: { type: String, default: "medium" },
      highContrast: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
    },
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
