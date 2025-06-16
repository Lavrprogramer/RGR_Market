const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const usersPath = path.join(__dirname, '../db/users.json');
const SECRET_KEY = 'mysecretkey123';

// ---------------------- Реєстрація ----------------------
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath));

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Користувач вже існує' });
  }

  const newUser = {
    id: Date.now(),
    username,
    password: bcrypt.hashSync(password, 8),
    role: 'user',
    balance: 500
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.status(201).json({ message: 'Користувача створено' });
});

// ---------------------- Вхід ----------------------
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath));

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(401).json({ message: 'Невірний пароль' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
  res.json({ token });
});

// ---------------------- Дані користувача ----------------------
router.get('/me', authenticateUser, (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    balance: user.balance
  });
});

// ---------------------- Поповнення балансу ----------------------
router.post('/topup', authenticateUser, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Невірна сума' });

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

  user.balance += amount;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ message: 'Баланс поповнено', balance: user.balance });
});

module.exports = router;
