const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },          // 商品名称
  manufacturer: { type: String, required: true },  // 制造商
  category: { type: String, enum: ['desktops', 'laptops', 'accessories'], required: true }, // 类别
  price: { type: Number, required: true },         // 价格
  stock: { type: Number, required: true },         // 当前库存
  imageUrl: { type: String, default: '' },         // 图片URL（可选）
});

module.exports = mongoose.model('Product', ProductSchema);
