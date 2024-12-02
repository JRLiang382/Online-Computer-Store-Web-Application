const express = require('express');
const router = express.Router();

let cart = [];

// Get the cart
router.get('/', (req, res) => {
    res.json(cart);
});

// Add an item
router.post('/', (req, res) => {
    const { productId, quantity } = req.body;
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    res.json(cart);
});

// Remove one
router.delete('/:productId', (req, res) => {
    const productId = req.params.productId;
    const item = cart.find(item => item.productId === productId);

    if (item) {
        if (item.quantity > 1) {
            // Decrease quantity by 1 if quantity > 1
            item.quantity -= 1;
        } else {
            // Remove the item if quantity is 1
            cart = cart.filter(item => item.productId !== productId);
        }
    }
    res.json(cart);
});


// Update the quantity
router.put('/:productId', (req, res) => {
    const { quantity } = req.body;
    const item = cart.find(item => item.productId === req.params.productId);
    if (item) {
        item.quantity = quantity;
    }
    res.json(cart);
});

module.exports = router;
