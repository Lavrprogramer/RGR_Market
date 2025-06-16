const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const ordersPath = path.join(__dirname, '../db/orders.json');

// --------------------Купівля гри--------------
router.post('/', authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { gameId } = req.body;

  const usersPath = path.join(__dirname, '../db/users.json');
  const orders = JSON.parse(fs.readFileSync(ordersPath));
  const users = JSON.parse(fs.readFileSync(usersPath));
  const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/games.json')));

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

  const game = games.find(g => g.id === gameId);
  if (!game) return res.status(404).json({ message: 'Гру не знайдено' });

  if (orders.some(order => order.userId === userId && order.gameId === gameId)) {
    return res.status(400).json({ message: 'Гра вже придбана' });
  }

  if (user.balance < game.price) {
    return res.status(403).json({ message: 'Недостатньо коштів' });
  }

  user.balance -= game.price;
  orders.push({ userId, gameId });

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  res.status(201).json({ message: 'Гру придбано', balance: user.balance });
});


// ------------------Бібліотека користувача---------------
router.get('/my', authenticateUser, (req, res) => {
  const userId = req.user.id;
  const orders = JSON.parse(fs.readFileSync(ordersPath));
  const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/games.json')));

  const userGames = orders
    .filter(order => order.userId === userId)
    .map(order => games.find(g => g.id === order.gameId));

  res.json(userGames);
});

module.exports = router;
