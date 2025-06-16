const panel = document.getElementById('admin-panel');
const form = document.getElementById('gameForm');
let editId = null;

function resetForm() {
  form.reset();
  editId = null;
  form.gameId.value = '';
}

function loadGames() {
  fetch(`${API_URL}/games`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  .then(res => res.json())
  .then(games => {
    panel.innerHTML = '';
    games.forEach(game => {
      const div = document.createElement('div');
      div.innerHTML = `
        <hr>
        <b>${game.title}</b> (${game.genre}) — ${game.price} грн<br>
        <button onclick="editGame(${game.id})">✏️ Редагувати</button>
        <button onclick="deleteGame(${game.id})">🗑️ Видалити</button>
      `;
      panel.appendChild(div);
    });
  });
}

function editGame(id) {
  fetch(`${API_URL}/games/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  .then(res => res.json())
  .then(game => {
    form.title.value = game.title;
    form.genre.value = game.genre;
    form.price.value = game.price;
    form.fileUrl.value = game.fileUrl;
    form.description.value = game.description || '';
    form.images.value = game.images ? game.images.join(', ') : '';
    form.gameId.value = game.id;
    editId = game.id;
  });
}

function deleteGame(id) {
  fetch(`${API_URL}/games/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(() => {
    alert('Гру видалено');
    loadGames();
  });
}

form.onsubmit = e => {
  e.preventDefault();

  const gameData = {
    title: form.title.value,
    genre: form.genre.value,
    price: parseFloat(form.price.value),
    fileUrl: form.fileUrl.value,
    description: form.description.value,
    images: form.images.value.split(',').map(s => s.trim()).filter(Boolean)
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `${API_URL}/games/${editId}` : `${API_URL}/games`;

  fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gameData)
  })
  .then(res => res.json())
  .then(response => {
    alert('Гру збережено');
    resetForm();
    loadGames();
  });
};

loadGames();
