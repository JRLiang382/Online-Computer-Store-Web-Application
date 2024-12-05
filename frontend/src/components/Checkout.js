import React, { useState } from 'react';
import axios from 'axios';
import './Checkout.css';

const Checkout = ({ cartItems, totalPrice, clearCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [orderSummary, setOrderSummary] = useState(null);
  const [error, setError] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      setError('Cart is empty. Please add items to your cart.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/payment/checkout', {
        cartItems,
        totalPrice,
        paymentMethod,
      });

      if (response.data.success) {
        setOrderSummary(response.data.orderSummary);
        clearCart(); // 清空购物车
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred during payment. Please try again.');
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {orderSummary ? (
        <div className="order-summary">
          <h3>Order Confirmation</h3>
          <p><strong>Order ID:</strong> {orderSummary.orderId}</p>
          <p><strong>Total Price:</strong> ${orderSummary.totalPrice}</p>
          <p><strong>Payment Method:</strong> {orderSummary.paymentMethod}</p>
          <p><strong>Status:</strong> {orderSummary.status}</p>
          <p><strong>Date:</strong> {orderSummary.timestamp}</p>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={handlePayment}>
          <div className="form-group">
            <label htmlFor="payment-method">Payment Method</label>
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
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <p>{item.name}</p>
                <p>${item.price} x {item.quantity}</p>
              </div>
            ))}
            <p><strong>Total Price:</strong> ${totalPrice}</p>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="pay-button">Pay Now</button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
