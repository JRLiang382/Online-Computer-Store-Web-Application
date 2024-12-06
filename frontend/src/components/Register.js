import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link
import './Login.css'; // Reuse the same CSS for styling

const Register = ({ setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); // CSRF token

  // Fetch CSRF token
  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/csrf-token', {
        withCredentials: true,
      });
      const tokenFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      if (!tokenFromCookie) throw new Error('CSRF token not found in cookies');
      setCsrfToken(tokenFromCookie);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      setError('Failed to fetch CSRF token. Please refresh the page.');
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!csrfToken) {
      setError('CSRF token is missing. Please refresh the page.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { username, password },
        {
          headers: {
            'X-XSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess('Registration successful! You can now log in.');
        setUsername('');
        setPassword('');
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
