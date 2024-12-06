import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]); // State to store products
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingProductId, setEditingProductId] = useState(null); // To track if editing a product

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products.');
    }
  };

  // Add or Update Product
  // 修改 handleAddOrUpdateProduct 函数
const handleAddOrUpdateProduct = async () => {
    if (!name || !manufacturer || !category || !price || !stock || !description || !imageUrl) {
      alert('All fields are required.');
      return;
    }
  
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
  
    try {
      if (editingProductId) {
        // 更新产品
        const response = await axios.put(
          `http://localhost:5000/api/products/update/${editingProductId}`, // 修改 URL 路径
          {
            username,
            name,
            manufacturer,
            category,
            price: Number(price), // 确保价格是数字
            stock: Number(stock), // 确保库存是数字
            description,
            imageUrl,
          },
          { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true // 如果需要 cookies
          }
        );
  
        if (response.data.success) {
          alert('Product updated successfully.');
          fetchProducts();
          resetForm();
        } else {
          alert(response.data.message || 'Failed to update product');
        }
      } else {
        // 添加产品
        const response = await axios.post(
          'http://localhost:5000/api/products/add',
          {
            username,
            name,
            manufacturer,
            category,
            price: Number(price),
            stock: Number(stock),
            description,
            imageUrl,
          },
          { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );
  
        if (response.data.success) {
          alert('Product added successfully.');
          fetchProducts();
          resetForm();
        } else {
          alert(response.data.message || 'Failed to add product');
        }
      }
    } catch (error) {
      console.error('Error adding/updating product:', error);
      alert(error.response?.data?.message || 'Failed to add or update product. Please try again.');
    }
  };

  // Delete Product
const handleDeleteProduct = async (productId) => {
    try {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/products/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: { username }
        }
      );
  
      if (response.data.success) {
        alert('Product deleted successfully');
        fetchProducts(); // 刷新产品列表
      } else {
        alert(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Set product data to form for editing
  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setName(product.name);
    setManufacturer(product.manufacturer);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setDescription(product.description);
    setImageUrl(product.imageUrl);
  };

  // Reset form
  const resetForm = () => {
    setEditingProductId(null);
    setName('');
    setManufacturer('');
    setCategory('');
    setPrice('');
    setStock('');
    setDescription('');
    setImageUrl('');
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="product-form">
        <h2>{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Manufacturer"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button onClick={handleAddOrUpdateProduct}>
          {editingProductId ? 'Update Product' : 'Add Product'}
        </button>
        {editingProductId && <button onClick={resetForm}>Cancel</button>}
      </div>

      <div className="product-list">
        <h2>Products</h2>
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.manufacturer}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button onClick={() => handleEditProduct(product)}>Edit</button>
                    <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
