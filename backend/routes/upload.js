
import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/product-image", upload.single("product-image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;

   res.json({ url: imageUrl });
});

router.post("/category-image", upload.single("category-image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });

  res.json({
    url: `${req.protocol}://${req.get("host")}/uploads/categories/${req.file.filename}`,
  });
});


export default router;


