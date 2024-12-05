const bcrypt = require('bcrypt');
const User = require('./models/User'); // 替换为你的 User 模型路径
const mongoose = require('mongoose');

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://127.0.0.1:27017/online-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createUsers = async () => {
  try {
    // 创建 user1
    const hashedPassword1 = await bcrypt.hash('user1', 10);
    const user1 = new User({
      username: 'user1',
      password: hashedPassword1,
      role: 'regular'
    });

    // 创建 user2
    const hashedPassword2 = await bcrypt.hash('user2', 10);
    const user2 = new User({
      username: 'user2',
      password: hashedPassword2,
      role: 'regular'
    });

    // 保存用户到数据库
    await user1.save();
    await user2.save();

    console.log('Users created successfully');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    // 断开数据库连接
    mongoose.disconnect();
  }
};

createUsers();
