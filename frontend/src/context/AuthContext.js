// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importa a função 'jwtDecode' da biblioteca jwt-decode (a forma correta para versões recentes)
import { jwtDecode } from 'jwt-decode';

// 1. Cria o Contexto
// Pense nisso como um container global para os dados de autenticação.
const AuthContext = createContext();
// Exporta como default para que outros arquivos possam importá-lo facilmente.
export default AuthContext;


// 2. Cria o Provedor do Contexto
// Este é um componente que vai "envolver" toda a nossa aplicação, 
// fornecendo os dados e as funções de autenticação para todos os componentes filhos.
export const AuthProvider = ({ children }) => {
  
  // --- GERENCIAMENTO DE ESTADO (useState) ---

  // Estado para guardar os tokens (access e refresh).
  // A função dentro do useState roda apenas na primeira vez que o componente carrega.
  // Ela verifica se já existem tokens no localStorage para manter o usuário logado.
  const [authTokens, setAuthTokens] = useState(() => 
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  
  // Estado para guardar as informações do usuário (extraídas do token).
  // Também verifica o localStorage na primeira carga.
  const [user, setUser] = useState(() => 
    localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null
  );

  // Hook para permitir o redirecionamento de páginas
  const navigate = useNavigate();

  // --- FUNÇÕES DE LÓGICA ---

  // Função de Login: é chamada pelo formulário da LoginPage.
  const loginUser = async (username, password) => {
    try {
      // Faz a chamada POST para a API de token do Django
      const response = await axios.post('http://localhost:8081/api/token/', {
        username,
        password
      });
      
      const data = response.data;
      
      // Se a resposta for sucesso, atualizamos nossos estados
      setAuthTokens(data);
      setUser(jwtDecode(data.access)); // Decodifica o token de acesso para pegar os dados do usuário
      
      // Guarda os tokens no localStorage para persistir a sessão
      localStorage.setItem('authTokens', JSON.stringify(data));
      
      // Redireciona para o dashboard
      navigate('/');

    } catch (error) {
      console.error("Erro no login:", error);
      // Lança um erro para que o componente LoginPage possa exibir uma mensagem
      throw new Error("Falha na autenticação");
    }
  };

  // Função de Logout: é chamada pelo botão na Navbar.
  const logoutUser = () => {
    // Limpa os estados
    setAuthTokens(null);
    setUser(null);
    // Remove os tokens do localStorage
    localStorage.removeItem('authTokens');
    // Remove o cabeçalho de autorização do axios
    delete axios.defaults.headers.common['Authorization'];
    // Redireciona para a página de login
    navigate('/login');
  };

  // --- EFEITO COLATERAL (useEffect) ---

  // Este efeito roda toda vez que 'authTokens' muda.
  // Sua função é configurar o cabeçalho de autorização para todas as futuras chamadas do axios.
  useEffect(() => {
    if (authTokens) {
      // Se temos um token, todas as chamadas futuras incluirão o 'Bearer token'
      axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
    } else {
      // Se não temos um token (logout), removemos o cabeçalho
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authTokens]);


  // --- DADOS FORNECIDOS PELO CONTEXTO ---

  // Objeto com os valores e funções que queremos disponibilizar para o resto da aplicação
  const contextData = {
    user: user,
    authTokens: authTokens,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  // O componente Provedor retorna o Contexto com os dados, envolvendo os componentes filhos
  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};