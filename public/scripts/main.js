const token = getToken();
const gameList = document.getElementById('game-list');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const userInfo = document.getElementById('userInfo');
const usernameDisplay = document.getElementById('usernameDisplay');
const userBalance = document.getElementById('userBalance');
const logoutButton = document.getElementById('logoutButton');
const adminLink = document.getElementById('adminLink');

// Показ ігор
function loadGames() {
  fetch(`${API_URL}/games`)
    .then(res => res.json())
    .then(renderGames)
    .catch(() => gameList.innerHTML = '<p>Не вдалося завантажити ігри</p>');
}

function renderGames(games) {
  gameList.innerHTML = '';
  games.forEach(game => {
    const div = document.createElement('div');
    div.className = 'game-card';
    div.innerHTML = `
      <img src="${(game.images?.[0]) || './images/placeholder.jpg'}" class="game-cover" alt="${game.title}" onerror="this.src='./images/placeholder.jpg';">
      <div class="game-info">
        <h3>${game.title}</h3>
        <p>Жанр: ${game.genre}</p>
        <p>Ціна: ${game.price} грн</p>
        <button class="details-button" onclick="window.location.href='game.html?id=${game.id}'">Детальніше</button>
      </div>
    `;
    gameList.appendChild(div);
  });
}

// ---------------Авторизований користувач------------
if (token) {
  loginLink.style.display = 'none';
  registerLink.style.display = 'none';
  userInfo.style.display = 'flex';
  topupLink.style.display = 'inline-block';
  libraryLink.style.display = 'inline-block';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    usernameDisplay.textContent = `${payload.username || 'Користувач'}`;

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      userBalance.textContent = ` | Баланс: ${data.balance} грн`;
      if (data.role === 'admin') adminLink.style.display = 'inline-block';
    });
  } catch (err) {
    console.warn('Помилка токена:', err);
  }
} else {
  loginLink.style.display = 'inline-block';
  registerLink.style.display = 'inline-block';
  userInfo.style.display = 'none';
}

//--------------------Вихід----------------
logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = 'index.html';
});

// -------------------Поповнення-------------
document.getElementById('topupForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('topupAmount').value);
  if (amount <= 0) return alert('Некоректна сума');

  fetch(`${API_URL}/auth/topup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  })
    .then(res => res.json())
    .then(data => {
      userBalance.textContent = ` | Баланс: ${data.balance} грн`;
      alert('Поповнення успішне!');
      document.getElementById('topupAmount').value = '';
    });
});

function applyFilters() {
  const search = document.getElementById('search').value;
  const genre = document.getElementById('genreFilter').value;
  let url = `${API_URL}/games?`;
  if (search) url += `title=${encodeURIComponent(search)}&`;
  if (genre) url += `genre=${encodeURIComponent(genre)}`;

  fetch(url)
    .then(res => res.json())
    .then(renderGames);
}

loadGames();