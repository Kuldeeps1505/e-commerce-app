import express from "express";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";


const router = express.Router();


/**
 * @route   PUT /api/admin/suppliers/:id
 * @desc    Approve or reject supplier; optionally link to user on approval
 * @body    { status: "approved"|"rejected", comment?: string, userId?: string }
 * @access  Admin only
 */
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status, comment, userId } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    supplier.status = status;
    if (comment !== undefined) supplier.adminComment = comment;

    // On approval, optionally link to a user (only admin can set this)
    if (status === "approved" && userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      supplier.user = userId;
    }

    await supplier.save();

    // Sync user profile when supplier has a linked user
    if (supplier.user) {
      await User.findByIdAndUpdate(supplier.user, {
        supplierStatus: status,
        supplierRef: supplier._id
      });
    }

    res.json({
      message: `Supplier ${status} successfully`,
      supplier
    });
  } catch (error) {
    console.error("Admin supplier update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
