

import express from 'express'
import Product from '../models/Product.js'
import Category from "../models/Category.js";

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // 🔎 SEARCH
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 📂 CATEGORY (convert name/slug → ObjectId)
    if (category && category !== "All Categories") {
      const cat = await Category.findOne({
        $or: [{ name: category }, { slug: category }]
      });
      if (cat) query.category = cat._id;
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort(sort || "-createdAt");

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this route BEFORE router.get('/:slug')
router.get('/suggestions', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const query = {
      isActive: true,
      name: { $regex: q, $options: 'i' }
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      const cat = await Category.findById(category);
      if (cat) query.category = cat._id;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(5)
      .select('name slug images price category')
      .sort('-views');

    res.json({ suggestions: products });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add search route
router.get('/search', async (req, res) => {
  try {
    const { q, category, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      const cat = await Category.findById(category);
      if (cat) query.category = cat._id;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .sort(sort || '-createdAt');

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/:slug', async (req, res) => { 
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
    
    if (!product) return res.status(404).json({ error: 'Product not found' })
    
    product.views += 1
    await product.save()
    
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { name, slug, description, category, price, moq } = req.body
    if (!name || !slug || !description || !category || !price || !moq  ) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, slug, description, category, price, moq, images' 
      })
    }

    const product = new Product(req.body)
    const savedProduct = await product.save()
    
    console.log('✅ Product saved:', savedProduct._id)
    res.status(201).json(savedProduct)
  } catch (error) {
    console.error('❌ Product save error:', error.message)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ error: `Duplicate ${field}. Please use a unique value.` })
    }
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(product)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});





export default router
