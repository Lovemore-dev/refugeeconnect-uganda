// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Registration page
router.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("pages/auth/register", {
    title: "Register - RefugeeConnect",
    layout: "layouts/auth",
  });
});

// Registration process
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      refugeeStatus,
      preferredLanguage,
      district,
      settlement,
      age,
      gender,
      nationality,
      familySize,
    } = req.body;

    // Validation
    if (password !== confirmPassword) {
      return res.render("pages/auth/register", {
        error: "Passwords do not match",
        formData: req.body,
        layout: "layouts/auth",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.render("pages/auth/register", {
        error: "User with this email or phone already exists",
        formData: req.body,
        layout: "layouts/auth",
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      refugeeStatus,
      preferredLanguage: preferredLanguage || "en",
      location: {
        district,
        settlement,
      },
      demographics: {
        age: age ? parseInt(age) : null,
        gender,
        nationality,
        familySize: familySize ? parseInt(familySize) : null,
      },
    });

    await user.save();

    // Create session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      refugeeStatus: user.refugeeStatus,
      preferredLanguage: user.preferredLanguage,
      location: user.location,
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Registration error:", error);
    res.render("pages/auth/register", {
      error: "Registration failed. Please try again.",
      formData: req.body,
      layout: "layouts/auth",
    });
  }
});

// Login page
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("pages/auth/login", {
    title: "Login - RefugeeConnect",
    layout: "layouts/auth",
  });
});

// Login process
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.render("pages/auth/login", {
        error: "Invalid email or password",
        layout: "layouts/auth",
      });
    }

    if (!user.isActive) {
      return res.render("pages/auth/login", {
        error: "Account is deactivated. Please contact support.",
        layout: "layouts/auth",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      refugeeStatus: user.refugeeStatus,
      preferredLanguage: user.preferredLanguage,
      location: user.location,
      preferences: user.preferences,
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.render("pages/auth/login", {
      error: "Login failed. Please try again.",
      layout: "layouts/auth",
    });
  }
});

// Logout
router.post("/logout", authMiddleware, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Profile update
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Update session
    req.session.user = {
      ...req.session.user,
      ...updateData,
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// Change password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user._id;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    const user = await User.findById(userId);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Password change failed" });
  }
});

module.exports = router;
