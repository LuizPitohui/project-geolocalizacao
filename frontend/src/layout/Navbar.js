
// frontend/src/layout/Navbar.js (VERSÃO FINAL E CORRIGIDA)

import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Navbar() {
  // A Navbar já sabe quem é o usuário através do AuthContext
  const { user, logoutUser } = useContext(AuthContext);

  // --- CORREÇÃO PRINCIPAL ---
  // Se não houver um usuário logado, o componente não renderiza nada (retorna null).
  if (!user) {
    return null;
  }

  // Se houver um usuário, o componente renderiza a barra de navegação normalmente.
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 10 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Norte Tech Geolocalização
          </Link>
        </Typography>
        
        {/* Este trecho já estava correto, mostrando o nome do usuário e o botão de logout */}
        <Typography sx={{ mr: 2 }}>
          Olá, {user.username}
        </Typography>
        <Button color="inherit" onClick={logoutUser}>
          Logout
        </Button>
        
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;