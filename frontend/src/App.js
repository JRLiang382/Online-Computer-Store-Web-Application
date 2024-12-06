import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (!token || !username) {
          setLoggedIn(false);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setLoggedIn(true);
          setIsAdmin(username === 'admin');
        } else {
          setLoggedIn(false);
          setIsAdmin(false);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 如果还在加载就显示 Loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 记录当前状态
  console.log('Current auth state:', { loggedIn, isAdmin });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <ProductList /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={loggedIn ? (
            <Navigate to="/" />
          ) : (
            <Login setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} />
          )}
        />
        <Route
          path="/register"
          element={loggedIn ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/products/:productId"
          element={loggedIn ? <ProductDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={
            (loggedIn && isAdmin) ? <AdminPanel /> : <Navigate to="/" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;