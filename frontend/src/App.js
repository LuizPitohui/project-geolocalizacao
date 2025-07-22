// frontend/src/App.js (VERSÃO FINAL E CORRIGIDA)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute'; // Importa nosso "segurança"
import Navbar from './layout/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Navbar />
          <Routes>
            {/* Rota pública para o login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* --- CORREÇÃO PRINCIPAL --- */}
            {/* Todas as rotas dentro de PrivateRoute só serão acessíveis se o usuário estiver logado */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DashboardPage />} />
              {/* Se você tiver outras páginas protegidas, adicione-as aqui */}
            </Route>

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;