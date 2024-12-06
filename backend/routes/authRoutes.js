const express = require('express');
const { check, validationResult } = require('express-validator'); // 引入 express-validator
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const SECRET_KEY = 'admin'; // 建议用环境变量存储

// 用户注册
router.post(
  '/register',
  [
    // 使用 express-validator 验证和清理用户输入
    check('username')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 3 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户
      const newUser = new User({
        username,
        password: hashedPassword,
        role: 'regular', // 默认角色
      });

      await newUser.save();

      // 生成 JWT
      const token = jwt.sign(
        { id: newUser._id, username: newUser.username, role: newUser.role },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      res.status(201).json({ success: true, message: 'User registered successfully', token });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
);

// 用户登录
router.post(
  '/login',
  [
    // 使用 express-validator 验证和清理用户输入
    check('username').trim().escape().notEmpty().withMessage('Username is required'),
    check('password').trim().escape().notEmpty().withMessage('Password is required'),
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
        { expiresIn: '24h' }
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

// 获取当前用户信息
// 获取当前用户信息
router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // 从请求头中提取 token
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // 验证 token 并解析用户信息
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).select('username isAdmin'); // 添加 isAdmin 字段

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 返回用户信息，包括管理员状态
    res.status(200).json({
      success: true,
      username: user.username,
      isAdmin: user.username === 'admin' // 这里判断是否为管理员
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});


module.exports = router;
