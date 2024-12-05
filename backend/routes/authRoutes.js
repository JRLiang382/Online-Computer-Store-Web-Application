const express = require('express');
const { check, validationResult } = require('express-validator'); // 引入 express-validator
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const SECRET_KEY = 'admin'; // 建议用环境变量存储

// 用户登录
router.post(
  '/login',
  [
    // 使用 express-validator 验证和清理用户输入
    check('username').trim().escape().notEmpty().withMessage('Username is required'),
    check('password').trim().escape().notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // 验证密码
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // 生成 JWT
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({ success: true, token, role: user.role });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
);

// 受保护路由示例
router.get('/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // 从请求头获取 token
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ success: true, message: 'You have access', user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
