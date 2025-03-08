const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Добавляем cors
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sizeRoutes = require('./routes/sizeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sizes', sizeRoutes);

app.get('/', (req, res) => {
  res.send('Добро пожаловать в AlessandroVitorio API!');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});