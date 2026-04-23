const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const listingRoutes = require('./src/routes/listingRoutes');

const app  = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) =>
  res.json({ status: 'OK', service: 'listing-service', timestamp: new Date() })
);

app.use('/api/listings', listingRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-listings')
  .then(() => {
    console.log('Listing Service connected to MongoDB');
    app.listen(PORT, () => console.log(`Listing Service running on port ${PORT}`));
  })
  .catch((err) => { console.error(err); process.exit(1); });