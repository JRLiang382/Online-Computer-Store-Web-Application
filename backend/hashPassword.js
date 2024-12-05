const bcrypt = require('bcrypt');
const User = require('./models/User'); // 替换为你的 User 模型路径
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/online-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const hashPassword = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin', 10); // 加密密码
    await User.updateOne({ username: 'admin' }, { password: hashedPassword });
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    mongoose.disconnect();
  }
};

hashPassword();
