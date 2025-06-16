const token = getToken();

//--------------------Показати інформацію про користувача---------------
if (token) {
  document.getElementById('userInfo').style.display = 'flex';
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('usernameDisplay').textContent = `${payload.username}`;
    
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json())
      .then(user => {
        document.getElementById('userBalance').textContent = `Баланс: ${user.balance} грн`;
        if (user.role === 'admin') document.getElementById('adminLink').style.display = 'inline-block';
      });
  } catch (e) {
    localStorage.removeItem('token');
    location.href = 'index.html';
  }
}

// -------------Вихід-------------
document.getElementById('logoutButton')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = 'index.html';
});

// -----------------Завантажити ігри з бібліотеки--------------
fetch(`${API_URL}/orders/my`, { headers: { Authorization: `Bearer ${token}` }})
  .then(res => res.json())
  .then(games => {
    const container = document.getElementById('library-list');
    
    if (games.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #aaa; padding: 60px 20px;">
          <h3 style="color: #00adef;">Ваша бібліотека порожня</h3>
          <p>Придбайте ігри в <a href="index.html" style="color: #00adef;">магазині</a></p>
        </div>
      `;
      return;
    }
    
    games.forEach(game => {
      const div = document.createElement('div');
      div.className = 'library-item';
      div.innerHTML = `
         <img src="${(game.images?.[0]) || './images/placeholder.jpg'}" class="game-cover" alt="${game.title}" onerror="this.src='./images/placeholder.jpg';">
        <div class="game-info">
          <h3>${game.title}</h3>
          <p><strong>Жанр:</strong> ${game.genre}</p>
          <button onclick="window.location.href='download.html?id=${game.id}&title=${encodeURIComponent(game.title)}'">
            Завантажити
          </button>
          <button onclick="window.location.href='game.html?id=${game.id}'" class="details-button">
            Детальніше
          </button>
        </div>
      `;
      container.appendChild(div);
    });
  })
  .catch(() => {
    document.getElementById('library-list').innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #ff4444; padding: 60px 20px;">
        <h3>Помилка завантаження</h3>
        <p>Спробуйте оновити сторінку</p>
      </div>
    `;
  });