const express = require('express');
const router = express.Router();

// 模拟的支付处理（POST /api/payment/checkout）
router.post('/checkout', (req, res) => {
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

  // 模拟支付处理成功
  const orderSummary = {
    orderId: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    cartItems,
    totalPrice,
    paymentMethod,
    status: 'Payment Successful',
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json({ success: true, orderSummary });
});

module.exports = router;
