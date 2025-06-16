const form = document.getElementById('registerForm');

form.onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Реєстрація успішна!');
    window.location.href = 'login.html';
  } else {
    alert(data.message || 'Помилка реєстрації');
  }
};
