const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'user-service', timestamp: new Date() });
});

app.use('/api/users', userRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-users')
  .then(() => {
    console.log('User Service connected to MongoDB');
    app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });