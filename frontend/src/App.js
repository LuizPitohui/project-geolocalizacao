// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthContext, { AuthProvider } from './context/AuthContext';
import 'leaflet/dist/leaflet.css';
import Navbar from './layout/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Componente que protege as rotas
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

// Layout para as páginas logadas
const MainLayout = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <Navbar />
    <Box component="main" sx={{ flexGrow: 1, p: 0, height: 'calc(100vh - 64px)' }}>
      <DashboardPage /> 
    </Box>
  </Box>
);

function App() {
  return (
    // 1. O Router agora é o componente mais externo
    <Router>
      {/* 2. O AuthProvider fica DENTRO do Router */}
      <AuthProvider>
        {/* 3. As rotas ficam dentro de ambos */}
        <Routes>
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;