import express from 'express'
import Category from '../models/Category.js'


const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search/:name', async (req, res) => {
  try {
    const category = await Category.findOne({
      name: { $regex: req.params.name, $options: 'i' }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      id: category._id,
      name: category.name,
      slug: category.slug
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, description, parent } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = new Category({
      name,
      icon,
      description,
      parent: parent || null
    });

    const savedCategory = await category.save();

    console.log('✅ Category created:', savedCategory._id);

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('❌ Category creation error:', error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Category with same slug already exists'
      });
    }

    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name) {
  return res.status(400).json({ error: "Category name is required" });
}


    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(category )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
});

export default router;
