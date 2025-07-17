// src/components/FilterPanel.js

import React from 'react';
// Importando os componentes que usaremos do Material-UI
import { Box, Typography, TextField, Button, Autocomplete, Divider, CircularProgress } from '@mui/material';
// Importando o ícone de 'X' que usaremos no botão de limpar
import CloseIcon from '@mui/icons-material/Close';

// O painel recebe todas as funções e variáveis de que precisa via props
function FilterPanel({
  // Props para a busca principal
  filtro,
  setFiltro,

  // Props para a calculadora de rota
  todasLocalidades,
  setPontoA,
  setPontoB,
  velocidadeMedia,
  setVelocidadeMedia,
  handleCalcularDistancia,
  isLoading,
  distancia,
  tempoViagem,

  // Prop para a função que limpa a rota
  handleClearRota,
}) {

  return (
    // Box é um componente do MUI que usamos como um container genérico (uma div inteligente)
    <Box 
      sx={{
        width: 380, // Largura fixa do painel
        p: 3, // Padding (espaçamento interno) de 3 unidades (24px)
        borderLeft: '1px solid', // Borda à esquerda
        borderColor: 'divider', // Cor da borda definida pelo tema
        backgroundColor: 'background.paper', // Cor de fundo do nosso tema
        display: 'flex',
        flexDirection: 'column',
        gap: 3 // Espaço entre as seções
      }}
    >
      {/* Seção de Busca Principal */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Buscar Localidade
        </Typography>
        <TextField
          fullWidth // Ocupa 100% da largura do painel
          label="Buscar por localidade..."
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          size="small"
        />
      </Box>

      <Divider /> {/* Uma linha para separar as seções */}

      {/* Seção da Calculadora de Rota */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Calculadora de Rota
        </Typography>
        
        <Autocomplete
          options={todasLocalidades}
          getOptionLabel={(option) => option.comunidade ? `${option.comunidade}, ${option.municipio}`: ''}
          onChange={(event, newValue) => {
            setPontoA(newValue ? newValue.id : '');
          }}
          renderInput={(params) => <TextField {...params} label="Ponto de Partida" variant="outlined" margin="normal" />}
          size="small"
        />

        <Autocomplete
          options={todasLocalidades}
          getOptionLabel={(option) => option.comunidade ? `${option.comunidade}, ${option.municipio}`: ''}
          onChange={(event, newValue) => {
            setPontoB(newValue ? newValue.id : '');
          }}
          renderInput={(params) => <TextField {...params} label="Ponto de Chegada" variant="outlined" margin="normal" />}
          size="small"
        />

        <TextField
          label="Velocidade Média (km/h)"
          type="number"
          value={velocidadeMedia}
          onChange={(e) => setVelocidadeMedia(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
          size="small"
        />
        
        <Button 
          variant="contained" 
          color="primary"
          fullWidth
          onClick={handleCalcularDistancia}
          disabled={isLoading}
          sx={{ mt: 1, height: '40px' }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Calcular Rota'}
        </Button>

        {/* Caixa de resultados com o novo botão de limpar */}
        {distancia !== null && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, position: 'relative' }}>
            <Typography variant="body2"><strong>Distância:</strong> {distancia} km</Typography>
            <Typography variant="body2"><strong>Velocidade Média:</strong> {velocidadeMedia} km/h</Typography>
            <Typography variant="body2"><strong>Tempo Estimado:</strong> {tempoViagem}</Typography>
            
            {/* O BOTÃO DE LIMPAR A ROTA */}
            <Button
              size="small"
              onClick={handleClearRota}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                minWidth: 'auto',
                p: '4px'
              }}
              title="Limpar Rota"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default FilterPanel;