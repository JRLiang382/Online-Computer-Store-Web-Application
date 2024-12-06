import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ setLoggedIn, setIsAdmin }) => {  // 添加 setIsAdmin 参数
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!csrfToken) {
      setError('CSRF token is missing. Please refresh the page.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { username, password },
        {
          headers: {
            'X-XSRF-TOKEN': csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // 存储令牌和用户名
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);

        // 设置登录状态
        setLoggedIn(true);

        // 导航到主页并刷新页面
        navigate('/', { replace: true });
        window.location.reload(); // 添加这一行
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred while logging in. Please try again.'
      );
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
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
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;