import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams(); // 从 URL 获取 productId
  const [product, setProduct] = useState(null);
  const [ratings, setRatings] = useState([]); // 存储评分和评论
  const [newRating, setNewRating] = useState(5); // 新评分，默认 5 星
  const [newComment, setNewComment] = useState(''); // 新评论
  const [username, setUsername] = useState(''); // 当前登录用户名
  const [error, setError] = useState('');

  // 获取产品详情
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to fetch product details.');
      }
    };

    fetchProductDetails();
  }, [productId]);

  // 获取评论和评分
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get('https://6751349c69dc1669ec1d6417.mockapi.io/ratings');
        const productRatings = response.data.filter((rating) => rating.productId === productId);
        setRatings(productRatings);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        setError('Failed to fetch ratings.');
      }
    };

    fetchRatings();
  }, [productId]);

  // 获取当前登录用户
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
        setError('Failed to fetch user information.');
      }
    };

    fetchUsername();
  }, []);

  // 提交新的评分和评论
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    const newReview = {
      username,
      rating: newRating,
      comment: newComment,
      timestamp: new Date().toISOString(),
      productId: productId,
    };

    try {
      const response = await axios.post('https://6751349c69dc1669ec1d6417.mockapi.io/ratings', newReview);
      if (response.status === 201) {
        // 使用后端返回的数据，以确保有唯一的id
        setRatings((prevRatings) => [...prevRatings, response.data]); 
        setNewComment(''); // 清空输入框
        setNewRating(5); // 重置评分
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An error occurred while submitting your review.');
    }
  };

  // 加入购物车逻辑
  const handleAddToCart = () => {
    const confirmed = window.confirm('Are you sure you want to add this item to the cart?');
    if (confirmed && product) {
      let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = currentCart.find(item => item._id === product._id);
      const currentQuantityInCart = existingProduct ? existingProduct.quantity : 0;

      // 检查库存
      if (product.stock && currentQuantityInCart >= product.stock) {
        alert(`Cannot add more. Only ${product.stock} items available in stock.`);
        return;
      }

      let updatedCart;
      if (existingProduct) {
        updatedCart = currentCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...currentCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      console.log('Add to Cart works.');
    }
  };

  if (error) return <p>{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details">
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} />
      <p>{product.description}</p>

      {/* 新增的 "Add to Cart" 按钮 */}
      <button onClick={handleAddToCart}>Add to Cart</button>

      <h3>Ratings and Reviews</h3>
      {ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        ratings.map((rating) => (
          <div key={rating.id} className="review">
            <p><strong>{rating.username}</strong>: {rating.comment}</p>
            <p>Rating: {rating.rating} / 5</p>
            <p>Date: {new Date(rating.timestamp).toLocaleString()}</p>
          </div>
        ))
      )}

      {/* 提交评分和评论 */}
      <form onSubmit={handleSubmitReview} className="review-form">
        <h3>Submit Your Review</h3>
        <label>
          Rating:
          <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <br />
        <label>
          Comment:
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="4"
            cols="50"
            placeholder="Write your review here..."
          />
        </label>
        <br />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default ProductDetails;
