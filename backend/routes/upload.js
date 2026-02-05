
import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/product-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;

  res.status(201).json({ url: imageUrl });
});

export default router;


