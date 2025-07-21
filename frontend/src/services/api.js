// frontend/src/services/api.js

import axios from 'axios';

// Cria uma instância "base" do axios com a URL do nosso backend Django.
// Isso evita que a gente precise digitar 'http://127.0.0.1:8000/api' toda vez.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
});

// --- Interceptor de Requisições ---
// Esta é uma função poderosa do axios que "intercepta" toda requisição
// antes que ela seja enviada. Usamos isso para adicionar o token de autenticação
// em todas as chamadas para a nossa API protegida.
api.interceptors.request.use(async config => {
  // Pega o objeto 'authTokens' do localStorage.
  const authTokens = localStorage.getItem('authTokens') 
    ? JSON.parse(localStorage.getItem('authTokens')) 
    : null;

  // Se o token de acesso existir, adiciona ao cabeçalho da requisição.
  if (authTokens?.access) {
    config.headers.Authorization = `Bearer ${authTokens.access}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;

