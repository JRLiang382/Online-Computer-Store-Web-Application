const express = require('express');
const Product = require('../models/Product');
const router = express.Router();



// 获取所有产品
router.get('/', async (req, res) => {
    try {
      const products = await Product.find(); // 从 MongoDB 获取所有产品
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error });
    }
  });
  

// 添加产品
router.post('/', async (req, res) => {
  const { name, price, stock } = req.body;
  const product = new Product({ name, price, stock });
  await product.save();
  res.json(product);
});

// 获取单个商品的详细信息
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

module.exports = router;
