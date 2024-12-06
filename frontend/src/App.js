import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/" /> : <Login setLoggedIn={setLoggedIn} />}
        />
        <Route
          path="/register"
          element={loggedIn ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/"
          element={loggedIn ? <ProductList /> : <Navigate to="/login" />}
        />
        <Route
          path="/products/:productId"
          element={loggedIn ? <ProductDetails /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
