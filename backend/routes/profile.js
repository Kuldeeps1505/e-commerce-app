import express from "express";
import User from "../models/User.js";
import Enquiry from "../models/Enquiry.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  try {
    // User basic info
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    // User enquiries (with admin reply)
    const enquiries = await Enquiry.find({ user: req.user._id })
      .populate("product", "name slug description")
      .sort({ createdAt: -1 })
      .lean();

  
    res.json({
      user: {
        ...user,
       
      },
      enquiries,
      
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
