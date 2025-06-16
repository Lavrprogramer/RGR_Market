const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = 'mysecretkey123';

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Немає токену' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Недійсний токен' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ лише для адміністратора' });
  }
}

//  Оновлена перевірка: або власник гри, або адмін
function userOwnsGameOrAdmin(req, res, next) {
  const userId = req.user.id;
  const userRole = req.user.role;
  const gameId = parseInt(req.params.id);

  if (userRole === 'admin') return next(); // якщо адмін — пропускаємо

  const ordersPath = path.join(__dirname, '../db/orders.json');
  const orders = JSON.parse(fs.readFileSync(ordersPath));

  const owns = orders.some(order => order.userId === userId && order.gameId === gameId);

  if (!owns) {
    return res.status(403).json({ message: 'Ви не купили цю гру' });
  }

  next();
}

module.exports = {
  authenticateUser,
  requireAdmin,
  userOwnsGameOrAdmin
};
