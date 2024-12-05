const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // 引入 Order 模型

// 模拟的支付处理（POST /api/payment/checkout）
router.post('/checkout', async (req, res) => {
  const { cartItems, totalPrice, paymentMethod } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  if (!totalPrice || totalPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid total price.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Payment method is required.' });
  }

  try {
    // 创建订单记录
    const orderId = `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder = new Order({
      orderId,
      cartItems,
      totalPrice,
      paymentMethod,
      status: 'Payment Successful',
    });

    await newOrder.save();

    // 返回订单摘要
    const orderSummary = {
      orderId,
      cartItems,
      totalPrice,
      paymentMethod,
      status: 'Payment Successful',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({ success: true, orderSummary });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Failed to save order.' });
  }
});

// 获取所有订单记录（GET /api/payment/orders）
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 }); // 按时间倒序排序
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

module.exports = router;
