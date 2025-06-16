const express = require('express');
const cors = require('cors');
const path = require('path');

// Підключення маршрутів
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());                     // Дозволяє доступ із браузера
app.use(express.json());            // Обробка JSON-тіла запитів

// Статичні файли (фронтенд)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/games', express.static(path.join(__dirname, 'public/games')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Переадресація головної сторінки
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// API маршрути
app.use('/auth', authRoutes);           // Реєстрація, вхід
app.use('/games', gamesRoutes);         // Ігри (CRUD, download)
app.use('/orders', ordersRoutes);       // Купівля, бібліотека

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущено на порту ${PORT}`);
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();

  Object.values(networkInterfaces).forEach(interfaces =>
    interfaces.forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`→ http://${iface.address}:${PORT}`);
      }
    })
  );
});
