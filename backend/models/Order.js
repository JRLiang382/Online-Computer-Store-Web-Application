const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  cartItems: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  username: { type: String, required: true }, // 新增字段，记录下单用户名称
});

module.exports = mongoose.model('Order', OrderSchema);
