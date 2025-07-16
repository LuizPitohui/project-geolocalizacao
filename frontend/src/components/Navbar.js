// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css'; // Mude a importação para o novo arquivo CSS

function Navbar() {
  const navigate = useNavigate();
  const usuario = { nome: 'Luiz' }; 

  const handleLogout = () => {
    console.log('Usuário deslogado!');
    navigate('/login');
  };

  return (
    // A classe principal agora é "navbar"
    <div className="navbar">
      <div className="navbar-left">
        <img src="/logo.png" alt="Logo da Empresa" className="navbar-logo" />
        <span className="navbar-welcome">Bem vindo, {usuario.nome}</span>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;