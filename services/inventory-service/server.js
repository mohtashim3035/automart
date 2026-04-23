const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
require('dotenv').config();

const inventoryRoutes = require('./src/routes/inventoryRoutes');

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) =>
  res.json({ status: 'OK', service: 'inventory-service', timestamp: new Date() })
);
app.use('/api/inventory', inventoryRoutes);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automart-inventory')
  .then(() => {
    console.log('Inventory Service connected to MongoDB');
    app.listen(PORT, () => console.log(`Inventory Service running on port ${PORT}`));
  })
  .catch((err) => { console.error(err); process.exit(1); });