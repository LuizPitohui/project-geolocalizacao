// frontend/src/context/AuthContext.js (VERSÃO FINAL)

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Função para buscar o token CSRF e depois verificar o status do usuário
    const initializeAuth = async () => {
      try {
        // 1. Pede o "código secreto" CSRF para o backend.
        // O backend responderá e o navegador salvará o cookie 'csrftoken' automaticamente.
        await api.get('/csrf/');
        
        // 2. Agora que temos o cookie, verificamos se já existe uma sessão.
        const response = await api.get('/user/');
        if (response.data.isAuthenticated) {
          setUser({ username: response.data.username });
        }
      } catch (error) {
        console.error("Erro na inicialização da autenticação:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const loginUser = async (username, password) => {
    try {
      // O interceptor no api.js já vai adicionar o token CSRF automaticamente aqui
      const response = await api.post('/login/', { username, password });
      setUser({ username: response.data.username });
      navigate('/');
    } catch (error) {
      console.error("Erro no login:", error);
      throw new Error("Falha na autenticação");
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const contextData = { user, loginUser, logoutUser };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};