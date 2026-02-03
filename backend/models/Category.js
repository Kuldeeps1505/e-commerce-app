import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  icon: String,
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  next();
});

export default mongoose.model('Category', categorySchema);
