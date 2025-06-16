const token = getToken();

document.getElementById('topupForm').addEventListener('submit', e => {
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
      alert(`Баланс поповнено. Новий баланс: ${data.balance} грн`);
      document.getElementById('topupAmount').value = '';
    })
    .catch(() => alert('Помилка при поповненні'));
});