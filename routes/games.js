const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateUser, requireAdmin, userOwnsGameOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const gamesPath = path.join(__dirname, '../db/games.json');

// --------------------Усі ігри + пошук---------------
router.get('/', (req, res) => {
  let games = JSON.parse(fs.readFileSync(gamesPath));
  const { genre, title } = req.query;

  if (genre) games = games.filter(g => g.genre.toLowerCase() === genre.toLowerCase());
  if (title) games = games.filter(g => g.title.toLowerCase().includes(title.toLowerCase()));

  res.json(games);
});

// -------------------Отримати одну гру--------------------------
router.get('/:id', (req, res) => {
  const games = JSON.parse(fs.readFileSync(gamesPath));
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) return res.status(404).json({ message: 'Гру не знайдено' });
  res.json(game);
});

// ------------------------------Додати гру (admin)------------------------
router.post('/', authenticateUser, requireAdmin, (req, res) => {
  const { title, genre, price, fileUrl, description, images } = req.body;
  const games = JSON.parse(fs.readFileSync(gamesPath));

  const newGame = {
    id: Date.now(),
    title,
    genre,
    price,
    fileUrl,
    description: description || '',
    images: images || []
  };

  games.push(newGame);
  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  res.status(201).json({ id: newGame.id });
});

// ---------------Оновити гру (admin)---------------
router.put('/:id', authenticateUser, requireAdmin, (req, res) => {
  const games = JSON.parse(fs.readFileSync(gamesPath));
  const index = games.findIndex(g => g.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Гру не знайдено' });

  games[index] = { ...games[index], ...req.body };
  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  res.json({ message: 'Гру оновлено' });
});

// --------------------Видалити гру (admin)--------------
router.delete('/:id', authenticateUser, requireAdmin, (req, res) => {
  let games = JSON.parse(fs.readFileSync(gamesPath));
  const id = parseInt(req.params.id);
  games = games.filter(g => g.id !== id);
  fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
  res.json({ message: 'Гру видалено' });
});

//----------------------- Завантаження гри (admin або власник)---------------
router.get('/download/:id', authenticateUser, userOwnsGameOrAdmin, (req, res) => {
  const games = JSON.parse(fs.readFileSync(gamesPath));
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game || !game.fileUrl) return res.status(404).json({ message: 'Файл не знайдено' });

  const filePath = path.join(__dirname, '../public', game.fileUrl);
  res.download(filePath);
});

module.exports = router;