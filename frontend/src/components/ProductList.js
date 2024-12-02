import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Fetch products
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Filter products
  const handleFilter = () => {
    const filtered = products.filter(product =>
      (category === '' || product.category === category) &&
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    setFilteredProducts(filtered);
  };

  // Search products
  const handleSearch = () => {
    const searched = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(searched);
  };

  // Add to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item._id === product._id);
      if (existingProduct) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item._id === productId) {
          if (item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 }; // Decrease quantity by 1
          } else {
            return null; // Remove item if quantity is 1
          }
        }
        return item;
      }).filter(Boolean); // Remove null values (items marked for removal)
    });
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="product-list">
      <h1>Online Computer Store</h1>

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="desktops">Desktops</option>
          <option value="laptops">Laptops</option>
          <option value="accessories">Accessories</option>
        </select>
        <input
          type="number"
          placeholder="Min Price"
          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
        />
        <input
          type="number"
          placeholder="Max Price"
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
        />
        <input
          type="text"
          placeholder="Search by name or manufacturer"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleFilter}>Apply Filters</button>
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Products */}
      <div className="grid-container">
        {filteredProducts.map(product => (
          <div className="product-card" key={product._id}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <h2>{product.name}</h2>
            <p>Manufacturer: {product.manufacturer}</p>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Shopping Cart */}
      <div className="cart">
        <h2>Shopping Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item._id} className="cart-item">
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <button
                onClick={() => removeFromCart(item._id)}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Remove
              </button>
            </div>
          ))
        )}
        <p>Subtotal: ${getSubtotal()}</p>
      </div>
    </div>
  );
};

export default ProductList;
