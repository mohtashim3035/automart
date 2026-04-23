const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const productRoutes = require('./src/routes/productRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'product-service', timestamp: new Date() });
});

app.use('/api/products', productRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-products')
  .then(() => {
    console.log('Product Service connected to MongoDB');
    app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });