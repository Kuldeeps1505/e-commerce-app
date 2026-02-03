import express from 'express';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/product-image',
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get(
      'host'
    )}/uploads/products/${req.file.filename}`;

    res.json({ url: imageUrl });
  }
);

export default router;
