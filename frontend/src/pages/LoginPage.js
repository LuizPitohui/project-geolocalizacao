import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
// 1. Importando o ThemeProvider e o createTheme para criar nosso tema local
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Fade,
  ThemeProvider,   // Para aplicar nosso tema
  createTheme,    // Para criar o tema
} from '@mui/material';

// 2. Definição do tema claro, específico para esta página
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003b85', // Um azul escuro e profissional para os botões
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff', // O card de login será branco
    },
    text: {
        primary: '#1c1c1c', // Texto principal quase preto
        secondary: '#555555' // Texto secundário cinza
    }
  },
});

// 3. Definição da animação do gradiente
const gradientAnimation = {
    '@keyframes gradient': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  };

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
    // 4. Envolvemos tudo com o ThemeProvider para aplicar nosso tema claro
    <ThemeProvider theme={lightTheme}>
      {/* Aplicamos a animação e o gradiente ao container principal */}
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // O gradiente agora tem mais cores para um efeito mais rico
          background: 'linear-gradient(-45deg, #e0eafc, #cfdef3, #a7c5eb, #6a82fb)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite', // Aplica a animação
          ...gradientAnimation, // Inclui os keyframes da animação
        }}
      >
        <Container component="main" maxWidth="xs">
          <Fade in={true} timeout={1000}>
            <Paper
              elevation={8}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 4,
                borderRadius: 2
              }}
            >
              <Avatar
                src="/logo.png"
                alt="Norte Tech Logo"
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  backgroundColor: 'transparent', // Fundo transparente para o avatar
                  '& .MuiAvatar-img': {
                    width: '75%',
                    height: '75%',
                    objectFit: 'contain'
                  }
                }}
              />

              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
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
                  sx={{ mt: 3, mb: 2, py: 1.5 }} // O botão usará a cor 'primary' do nosso lightTheme
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;