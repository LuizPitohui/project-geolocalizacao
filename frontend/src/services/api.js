// frontend/src/services/api.js (VERSÃO FINAL E CORRIGIDA)

import axios from 'axios';

// CORREÇÃO: Configura o axios globalmente para enviar credenciais (cookies) em cada requisição
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api`
});

// --- Interceptor para o Token CSRF ---
api.interceptors.request.use(config => {
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrfToken = getCookie('csrftoken');
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

export default api;