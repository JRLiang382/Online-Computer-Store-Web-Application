import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  // Hooks 必须在组件的顶层定义
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [orderSummary, setOrderSummary] = useState(null); // 用于存储订单摘要
  const [paymentMethod, setPaymentMethod] = useState('Credit Card'); // 默认支付方式

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token'); // 从 localStorage 获取 JWT
      if (!token) {
        setError('Unauthorized. Please login.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }, // 设置 Authorization Header
        });
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error fetching products. Please login again.');
      }
    };

    fetchProducts();
  }, []);

  // 过滤函数
  const handleFilter = () => {
    const filtered = products.filter((product) =>
      (category === '' || product.category === category) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    );
    setFilteredProducts(filtered);
  };

  // 搜索函数
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

  // 模拟支付处理
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    try {
      const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const response = await axios.post(
        'http://localhost:5000/api/payment/checkout',
        { cartItems: cart, totalPrice, paymentMethod },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOrderSummary(response.data.orderSummary);
        setCart([]); // 清空购物车
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An error occurred during checkout. Please try again.');
    }
  };

  // 处理注销逻辑
  const handleLogout = () => {
    localStorage.removeItem('token'); // 清除 JWT
    window.location.reload(); // 刷新页面返回登录界面
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="product-list">
      <h1>Online Computer Store</h1>
      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</button>

      {/* 筛选和搜索区 */}
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

      {/* 产品网格展示 */}
      <div className="grid-container">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-manufacturer">Manufacturer: {product.manufacturer}</p>
            <p className="product-category">Category: {product.category}</p>
            <p className="product-price">Price: ${product.price}</p>
            <p className="product-stock">In Stock: {product.stock}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* 购物车和结算展示 */}
      <div className="cart">
        <h2>Shopping Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <h3>{item.name}</h3>
                <p>Price: ${item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <button onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            ))}
            <p>
              <strong>Total Price:</strong> ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            </p>
            <div>
              <label htmlFor="payment-method">Payment Method: </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <button onClick={handleCheckout}>Checkout</button>
          </div>
        )}
      </div>

      {/* 订单摘要展示 */}
      {orderSummary && (
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p><strong>Order ID:</strong> {orderSummary.orderId}</p>
          <p><strong>Total Price:</strong> ${orderSummary.totalPrice}</p>
          <p><strong>Payment Method:</strong> {orderSummary.paymentMethod}</p>
          <p><strong>Status:</strong> {orderSummary.status}</p>
          <p><strong>Date:</strong> {orderSummary.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
