// src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
// 1. Importando mais componentes do MUI para o novo design
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Avatar, // Para o logo
  Fade // Para a animação
} from '@mui/material';

function LoginPage() {
  // A lógica de estado e submit continua exatamente a mesma
  const { loginUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginUser(username, password);
    } catch (err) {
      setError('Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 2. Container principal que ocupa a tela inteira e centraliza o conteúdo
    <Box 
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Um fundo gradiente sutil e profissional
        background: 'linear-gradient(to bottom right, #e0eafc, #cfdef3)',
      }}
    >
      <Container component="main" maxWidth="xs">
        {/* 3. A animação de Fade envolve o nosso card de login */}
        <Fade in={true} timeout={1000}>
          <Paper 
            elevation={8} // Aumentamos a sombra para mais destaque
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 4, // p = padding (espaçamento interno)
              borderRadius: 2 // Bordas um pouco mais arredondadas
            }}
          >
            {/* 4. Adicionamos o logo usando o componente Avatar */}

            <Avatar 
            src="/logo.png" 
            alt="Norte Tech Logo"
            // A mágica acontece aqui, na prop 'sx'
            sx={{
                // --- Estilos para o container do Avatar (o círculo) ---
                width: 80,
                height: 80,
                mb: 2,
                backgroundColor: 'background.paper', // Um fundo neutro para o logo

                // --- Estilos para a IMAGEM DENTRO do Avatar ---
                // O '&' se refere ao próprio Avatar.
                // O '.MuiAvatar-img' se refere à classe da imagem filha que queremos estilizar.
                '& .MuiAvatar-img': {
                width: '75%',  // A imagem ocupará 75% da área do círculo
                height: '75%', // Isso cria um efeito de "padding" visual
                objectFit: 'contain' // Garante que a imagem inteira apareça, sem cortes
                }
            }}
            />
            
  
            <Typography component="h1" variant="h4" sx={{fontWeight: 'bold'}}>
              Norte Tech
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nome de Usuário"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: '#003b85', '&:hover': { backgroundColor: '#002c6d' } }} // py = padding vertical
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default LoginPage;