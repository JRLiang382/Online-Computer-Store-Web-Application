const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true }, // 商品描述
  reviews: [ // 评论数组
    {
      username: { type: String, required: true },
      rating: { type: Number, required: true }, // 1 到 5
      comment: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  additionalImages: [String], // 额外图片 URL 列表
});

module.exports = mongoose.model('Product', productSchema);
