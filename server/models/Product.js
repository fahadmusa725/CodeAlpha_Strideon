const mongoose = require('mongoose');

// Stock is stored as a flat map: "colorway-size" → quantity
// e.g. { "Bred-9": 5, "Bred-10": 2, "Shadow-9": 0 }
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ['Running', 'Basketball', 'Lifestyle', 'Skate'],
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    colorways: [{ type: String }],
    sizes: [{ type: Number }],
    stock: {
      type: Map,
      of: Number,
      default: {},
    },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
