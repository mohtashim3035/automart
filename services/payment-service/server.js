const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const paymentRoutes = require('./src/routes/paymentRoutes');

const app  = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) =>
  res.json({ status: 'OK', service: 'payment-service', timestamp: new Date() })
);
app.use('/api/payments', paymentRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-payments')
  .then(() => {
    console.log('Payment Service connected to MongoDB');
    app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
  })
  .catch((err) => { console.error(err); process.exit(1); });