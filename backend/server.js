const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 数据库连接
mongoose.connect('mongodb://localhost:27017/online-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// 路由
app.use('/api/products', productRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
