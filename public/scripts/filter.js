function applyFilters() {
  const search = document.getElementById('search').value;
  const genre = document.getElementById('genreFilter').value;

  let url = `${API_URL}/games?`;
  if (search) url += `title=${encodeURIComponent(search)}&`;
  if (genre) url += `genre=${genre}`;

  fetch(url)
    .then(res => res.json())
    .then(games => {
      const container = document.getElementById('game-list');
      container.innerHTML = '';
      games.forEach(game => {
        const div = document.createElement('div');
        div.className = 'game-card';
        div.innerHTML = `
          <h3>${game.title}</h3>
          <p>${game.genre}</p>
          <p>${game.price} грн</p>
          <a href="game.html?id=${game.id}">Детальніше</a>
        `;
        container.appendChild(div);
      });
    });
}