import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kuldeepshinde12345678";
console.log("JWT_SECRET:", JWT_SECRET);

// SIGNUP Route
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Don't hash password here - User model pre-save hook will do it
    const user = new User({ name, email, password, role: role || 'user' });
    const savedUser = await user.save();

    console.log('✅ User registered:', savedUser._id);

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role },
      token,
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGIN Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login Error", error: error.message });
  }
});


export default router;