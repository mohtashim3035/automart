const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const orderRoutes = require('./src/routes/orderRoutes');

const app  = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) =>
  res.json({ status: 'OK', service: 'order-service', timestamp: new Date() })
);
app.use('/api/orders', orderRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-orders')
  .then(() => {
    console.log('Order Service connected to MongoDB');
    app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
  })
  .catch((err) => { console.error(err); process.exit(1); });