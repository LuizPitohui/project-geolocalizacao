// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar'; // Importe o componente Navbar
import './App.css';

// Componente de Layout com a Navbar
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-layout-navbar">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* A página de Login continua sem a navbar */}
        <Route path="/login" element={<LoginPage />} />

        {/* O Dashboard agora usa o layout com a Navbar no topo */}
        <Route 
          path="/" 
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;