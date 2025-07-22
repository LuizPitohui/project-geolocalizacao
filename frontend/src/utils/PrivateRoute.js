// frontend/src/utils/PrivateRoute.js (NOVO ARQUIVO)

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
  // Pega o estado do usuário do nosso contexto de autenticação
  const { user } = useContext(AuthContext);

  // Se houver um usuário, permite o acesso à rota filha (usando <Outlet />).
  // Se não, redireciona para a página de login.
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;