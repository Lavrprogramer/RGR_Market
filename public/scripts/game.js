const token = getToken();
const gameId = parseInt(new URLSearchParams(location.search).get('id'), 10);
const gameTitle = document.getElementById('gameTitle');
const gameGenre = document.getElementById('gameGenre');
const gamePrice = document.getElementById('gamePrice');
const gameDescription = document.getElementById('gameDescription');
const mainGameImage = document.getElementById('mainGameImage');
const screenshotGallery = document.getElementById('screenshotGallery');
const actionDiv = document.getElementById('action');
const modal = document.getElementById('modal');

async function loadGameDetails() {
  try {
    const gameRes = await fetch(`${API_URL}/games/${gameId}`);
    if (!gameRes.ok) throw new Error('Гру не знайдено');
    const game = await gameRes.json();

    gameTitle.textContent = game.title;
    gameGenre.textContent = `Жанр: ${game.genre}`;
    gamePrice.textContent = `Ціна: ${game.price} грн`;
    gameDescription.textContent = game.description || 'Опис відсутній';
    mainGameImage.src = game.images?.[0] || './images/standart.png';

   screenshotGallery.innerHTML = (game.images || []).slice(1).map(src =>
  `<img src="${src}" class="screenshot-thumb" onerror="this.src='/images/placeholder.jpg';">`
).join('');

document.querySelectorAll('.screenshot-thumb').forEach(img => {
  img.addEventListener('click', () => {
    mainGameImage.src = img.src;
  });
});


    showActionButton();
  } catch (e) {
    document.getElementById('game-container').innerHTML = `<p>${e.message}</p>`;
  }
}

async function showActionButton() {
  if (!token) {
    actionDiv.innerHTML = `<p>Увійдіть, щоб купити</p>`;
    return;
  }

  const res = await fetch(`${API_URL}/games/download/${gameId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 200) {
    //перехід на download.html
    actionDiv.innerHTML = `<button id="downloadBtn">Завантажити</button>`;
    document.getElementById('downloadBtn').onclick = () => {
      window.location.href = `download.html?id=${gameId}`;
    };
  } else if (res.status === 404) {
    actionDiv.innerHTML = `<p>Гру придбано, але файл відсутній! Можливо, ви зробили передзамовлення або ведуться роботи по оновленню</p>`;
  } else if (res.status === 403) {
    actionDiv.innerHTML = `<button onclick="showBuyModal()">Купити</button>`;
  } else {
    actionDiv.innerHTML = `<p>Помилка: ${res.status}</p>`;
  }
}

function showBuyModal() {
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

document.getElementById('confirmBuy').onclick = async () => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameId })
  });

  if (res.ok) {
    alert('Гру придбано!');
    closeModal();
    showActionButton();
    // Після успішної купівлі переходимо на сторінку завантаження 
    //window.location.href = `download.html?id=${gameId}`; -- закоментовано бо автозавантаження бісить
  } else {
    const data = await res.json();
    alert(data.message || 'Помилка купівлі');
  }
};

document.addEventListener('DOMContentLoaded', loadGameDetails);
