// src/layout/Navbar.js
import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
// A importação do useNavigate foi removida daqui
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';

function Navbar() {
  // A linha 'const navigate = useNavigate();' foi removida daqui
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
      <Toolbar>
        <Avatar src="/logo.png" sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard Geográfico
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 2 }}>
            Bem vindo, {user && user.username}
          </Typography>
          <Button color="#003b85" variant="outlined" onClick={logoutUser}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;