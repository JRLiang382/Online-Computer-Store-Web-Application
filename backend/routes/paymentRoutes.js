const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // 订单模型
const Product = require('../models/Product'); // 产品模型

// 模拟的支付处理（POST /api/payment/checkout）
router.post('/checkout', async (req, res) => {
  const { cartItems, totalPrice, paymentMethod, username } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  if (!totalPrice || totalPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid total price.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Payment method is required.' });
  }

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    // 检查库存是否足够
    for (const item of cartItems) {
      const product = await Product.findById(item._id); // 查找产品
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Only ${product.stock} left.`,
        });
      }
    }

    // 如果所有商品库存都足够，创建订单记录
    const orderId = `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder = new Order({
      orderId,
      cartItems,
      totalPrice,
      paymentMethod,
      status: 'Payment Successful',
      username,
    });

    await newOrder.save();

    // 减少库存
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      product.stock -= item.quantity; // 减少库存
      await product.save(); // 保存更新
    }

    // 返回订单摘要
    const orderSummary = {
      orderId,
      cartItems,
      totalPrice,
      paymentMethod,
      status: 'Payment Successful',
      timestamp: new Date().toISOString(),
      username,
    };

    res.status(200).json({ success: true, orderSummary });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ success: false, message: 'Failed to process checkout.' });
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
