const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Admin-only check
const isAdmin = (req, res, next) => {
  const { username } = req.body; // Assuming username is passed in the body
  if (username !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// Add a product (Admin only)
router.post('/add', async (req, res) => {
  const { username } = req.body; // Ensure the request contains the username

  if (username !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  const { name, manufacturer, category, price, stock, description, imageUrl } = req.body;

  try {
    const product = new Product({ name, manufacturer, category, price, stock, description, imageUrl });
    await product.save();
    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add product', error });
  }
});


// Update a product (Admin only)
router.put('/update/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// Delete a product (Admin only)
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body; // Ensure the username is passed in the body

  if (username !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.', error });
  }
});


// Get product details
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
