// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      if (token) {
        setLoggedIn(true);
        setIsAdmin(username === 'admin');
      } else {
        setLoggedIn(false);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <ProductList /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/" /> : <Login setLoggedIn={setLoggedIn} />}
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