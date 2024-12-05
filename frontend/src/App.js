import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login'; // Import the Login component

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // Manage login state

  useEffect(() => {
    // Check if the user is logged in (e.g., token exists in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/" /> : <Login setLoggedIn={setLoggedIn} />
          }
        />

        {/* Private Route: Product List */}
        <Route
          path="/"
          element={
            loggedIn ? <ProductList /> : <Navigate to="/login" />
          }
        />

        {/* Private Route: Product Details */}
        <Route
          path="/products/:productId"
          element={
            loggedIn ? <ProductDetails /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
