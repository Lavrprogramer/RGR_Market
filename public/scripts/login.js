document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
    alert('Вхід успішний!');
    window.location.href = 'index.html';
  } else {
    alert(data.message || 'Невірний логін або пароль');
  }
};
