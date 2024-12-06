// ProductList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => {
    // 从 localStorage 初始化购物车状态
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [error, setError] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState('');

  // 监听购物车变化，更新 localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 获取当前登录用户的用户名
  useEffect(() => {
    const fetchUsername = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please login.');
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching username:', error);
        setError('Failed to fetch user information. Please login again.');
      }
    };
  
    fetchUsername();
  }, []);

  // 获取产品数据并同步购物车
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please login.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedProducts = response.data;
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        // 同步购物车中的产品信息
        setCart(prevCart => {
          return prevCart.map(cartItem => {
            const updatedProduct = fetchedProducts.find(p => p._id === cartItem._id);
            if (updatedProduct) {
              // 更新产品信息，保留购物车中的数量
              return {
                ...updatedProduct,
                quantity: cartItem.quantity
              };
            }
            return cartItem;
          }).filter(item => {
            // 移除已不存在的产品
            const productExists = fetchedProducts.some(p => p._id === item._id);
            if (!productExists) {
              console.log(`Removing product ${item.name} from cart as it no longer exists`);
            }
            return productExists;
          });
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error fetching products. Please login again.');
      }
    };

    fetchProducts();
  }, []);

  // 获取订单记录
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/payment/orders', {
          withCredentials: true,
        });
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch order history.');
      }
    };
  
    fetchOrders();
  }, [orderSummary]);

  // 过滤产品
  const handleFilter = () => {
    const filtered = products.filter((product) =>
      (category === '' || product.category === category) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    );
    setFilteredProducts(filtered);
  };

  // 搜索产品
  const handleSearch = () => {
    const searched = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(searched);
  };

  // 添加到购物车
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      
      // 检查库存
      const currentProduct = products.find(p => p._id === product._id);
      const currentQuantityInCart = existingProduct ? existingProduct.quantity : 0;
      
      if (currentProduct && currentQuantityInCart >= currentProduct.stock) {
        alert(`Cannot add more. Only ${currentProduct.stock} items available in stock.`);
        return prevCart;
      }

      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // 从购物车移除
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // 更新购物车项数量
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.stock) {
      alert(`Cannot add more. Only ${product.stock} items available in stock.`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // 处理结账
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
  
    // 检查库存是否足够
    const insufficientStock = cart.find((item) => {
      const product = products.find((p) => p._id === item._id);
      return product && item.quantity > product.stock;
    });
  
    if (insufficientStock) {
      const product = products.find((p) => p._id === insufficientStock._id);
      alert(`Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`);
      return;
    }
  
    try {
      const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
      const response = await axios.post(
        'http://localhost:5000/api/payment/checkout',
        { cartItems: cart, totalPrice, paymentMethod, username },
        { withCredentials: true }
      );
  
      if (response.data.success) {
        setOrderSummary(response.data.orderSummary);
        setCart([]); // 清空购物车
        localStorage.removeItem('cart'); // 清除本地存储的购物车数据
  
        // 更新产品数据以反映库存变化
        const updatedProducts = products.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          if (cartItem) {
            return { ...product, stock: product.stock - cartItem.quantity };
          }
          return product;
        });
  
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An error occurred during checkout. Please try again.');
    }
  };

  // 处理注销
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // 清除购物车数据
    window.location.reload();
  };

  return (
    <div className="product-list">
      <h1>Online Computer Store</h1>
      <div className="header-actions">
        <div className="user-info">
          {username && <span>Welcome, {username}!</span>}
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="desktops">Desktops</option>
          <option value="laptops">Laptops</option>
          <option value="accessories">Accessories</option>
        </select>

        <div className="price-filters">
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="price-input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="price-input"
          />
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or manufacturer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>

        <button onClick={handleFilter} className="filter-button">Apply Filters</button>
      </div>

      <div className="main-content">
        <div className="grid-container">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product._id}>
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-details">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-manufacturer">Manufacturer: {product.manufacturer}</p>
                <p className="product-category">Category: {product.category}</p>
                <p className="product-price">Price: ${product.price.toFixed(2)}</p>
                <p className="product-stock">In Stock: {product.stock}</p>
                <div className="product-actions">
                  <Link to={`/products/${product._id}`}>
                    <button className="view-details-button">View Details</button>
                  </Link>
                  <button 
                    className={`add-to-cart-button ${product.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-section">
          <div className="cart">
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">Price: ${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-button"
                        onClick={() => updateCartItemQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-button"
                        onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= (products.find(p => p._id === item._id)?.stock || 0)}
                      >
                        +
                      </button>
                    </div>
                    <p className="item-subtotal">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                      className="remove-button"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="cart-summary">
                  <p className="cart-total">
                    Total Price: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </p>
                  <div className="payment-method">
                    <label htmlFor="payment-method">Payment Method: </label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="payment-select"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <button 
                    className="checkout-button"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>

          {orderSummary && (
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-details">
                <p><strong>Order ID:</strong> {orderSummary.orderId}</p>
                <p><strong>Total Price:</strong> ${orderSummary.totalPrice.toFixed(2)}</p>
                <p><strong>Tax (13%):</strong> ${(orderSummary.totalPrice * 0.13).toFixed(2)}</p>
                <p><strong>Total After Tax:</strong> ${(orderSummary.totalPrice * 1.13).toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {orderSummary.paymentMethod}</p>
                <p><strong>Status:</strong> {orderSummary.status}</p>
                <p><strong>Date:</strong> {orderSummary.timestamp}</p>
                <p><strong>Customer:</strong> {username}</p>
              </div>
            </div>
          )}

          <div className="order-history">
            <h2>Order History</h2>
            {orders.length === 0 ? (
              <p className="no-orders">No order history available.</p>
            ) : (
              <div className="order-list">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-item">
                    <p><strong>Order ID:</strong> {order.orderId}</p>
                    <p><strong>Customer:</strong> {order.username}</p>
                    <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
                    <p><strong>Tax (13%):</strong> ${(order.totalPrice * 0.13).toFixed(2)}</p>
                    <p><strong>Total After Tax:</strong> ${(order.totalPrice * 1.13).toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <hr />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;