const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['mens', 'womens', 'kids', 'smart', 'analog', 'accessories']
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide image URL']
    },
    rating: {
      type: Number,
      default: 4.5
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
