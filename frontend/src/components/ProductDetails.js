import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams(); // 获取 URL 中的商品 ID
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to fetch product details.');
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (error) return <p>{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details">
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} />
      <p><strong>Manufacturer:</strong> {product.manufacturer}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Description:</strong> {product.description}</p>

      {/* 显示附加图片 */}
      <div className="additional-images">
        {product.additionalImages.map((image, index) => (
          <img key={index} src={image} alt={`Additional ${index + 1}`} />
        ))}
      </div>

      {/* 显示评论 */}
      <div className="reviews">
        <h3>Reviews</h3>
        {product.reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          product.reviews.map((review, index) => (
            <div key={index} className="review">
              <p><strong>{review.username}</strong> ({new Date(review.timestamp).toLocaleDateString()}):</p>
              <p>Rating: {review.rating} / 5</p>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
