import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); // 用于存储 CSRF token

  // 获取 CSRF token
  const fetchCsrfToken = async () => {
    try {
      // 请求后端获取 CSRF token
      const response = await axios.get('http://localhost:5000/api/auth/csrf-token', {
        withCredentials: true, // 确保 cookie 被包含在请求中
      });
      // 从 cookie 中提取 CSRF token
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

  // 初始化时获取 CSRF token
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // 处理登录
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
            'X-XSRF-TOKEN': csrfToken, // 将 CSRF token 添加到请求头
          },
          withCredentials: true, // 确保 cookie 被包含在请求中
        }
      );

      if (response.data.success) {
        // 存储 JWT 到本地存储
        localStorage.setItem('token', response.data.token);

        // 设置登录状态
        setLoggedIn(true);
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred while logging in. Please try again.');
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
      </form>
    </div>
  );
};

export default Login;
