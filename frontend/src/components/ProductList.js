import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]); // 保存从后端获取的数据

  useEffect(() => {
    // 从后端获取产品数据
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data); // 设置产品数据
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  return (
    <div>
      <h1>Product List</h1>
      {products.length > 0 ? (
        products.map(product => (
          <div key={product._id} style={{ border: '1px solid #ddd', margin: '10px', padding: '10px' }}>
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>
        ))
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
};

export default ProductList;
