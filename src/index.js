const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Маршруты
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.send('Добро пожаловать в AlessandroVitorio API!');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});