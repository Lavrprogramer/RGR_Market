const API_URL = `${location.protocol}//${location.hostname}:3000`;


function getToken() {
  return localStorage.getItem('token');
}
