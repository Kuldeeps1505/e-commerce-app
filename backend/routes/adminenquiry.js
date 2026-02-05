import express from "express";
import Enquiry from "../models/Enquiry.js";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   PUT /api/admin/enquiries/:id/reply
 * @desc    Admin replies to an enquiry
 * @access  Admin only
 */
router.put("/:id/reply", protect, admin, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    enquiry.adminResponse = {
      message,
      respondedAt: new Date(),
      respondedBy: req.user._id
    };

    enquiry.status = "responded";
    await enquiry.save();

    // 🔔 Optional notification to user (if logged in user submitted enquiry)
    if (enquiry.user) {
      await User.findByIdAndUpdate(enquiry.user, {
        $push: {
          notifications: {
            message: `Admin replied to your enquiry: "${message}"`,
            read: false
          }
        }
      });
    }

    res.json({
      message: "Reply sent successfully",
      enquiry
    });

  } catch (error) {
    console.error("Admin enquiry reply error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
