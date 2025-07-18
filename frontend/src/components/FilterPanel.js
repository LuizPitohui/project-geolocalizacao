// frontend/src/components/FilterPanel.js

import React, { useState, useEffect } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, Box,
  Typography, Divider, Autocomplete, TextField, CircularProgress
} from '@mui/material';
import api from '../services/api';

const FilterPanel = ({ calhas, onFilterChange, onCalculateRoute, onClearFilters, currentFilters }) => {
  
  const [localidadesPontoA, setLocalidadesPontoA] = useState([]);
  const [localidadesPontoB, setLocalidadesPontoB] = useState([]);
  const [fontePontoA, setFontePontoA] = useState('');
  const [fontePontoB, setFontePontoB] = useState('');
  const [pontoA, setPontoA] = useState(null);
  const [pontoB, setPontoB] = useState(null);
  const [velocidade, setVelocidade] = useState(60);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const fetchLocalidadesPorFonte = async (fonte, setLocalidadesFunc, setLoadingFunc) => {
    if (!fonte) {
      setLocalidadesFunc([]);
      return;
    }
    setLoadingFunc(true);
    try {
      // Usamos limit=2000 para garantir que todos os pontos sejam carregados para os seletores
      const response = await api.get(`/localidades/?fonte_dados=${fonte}&limit=2000`); 
      const simplifiedLocalidades = response.data.features.map(feature => ({
        id: feature.properties.id,
        nome_comunidade: feature.properties.nome_comunidade,
        municipio: feature.properties.municipio,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        // Adicionando todos os dados para o popup
        ...feature.properties
      }));
      setLocalidadesFunc(simplifiedLocalidades);
    } catch (error) {
      console.error(`Erro ao buscar localidades da fonte ${fonte}:`, error);
    } finally {
      setLoadingFunc(false);
    }
  };

  useEffect(() => {
    fetchLocalidadesPorFonte(fontePontoA, setLocalidadesPontoA, setLoadingA);
    setPontoA(null);
  }, [fontePontoA]);

  useEffect(() => {
    fetchLocalidadesPorFonte(fontePontoB, setLocalidadesPontoB, setLoadingB);
    setPontoB(null);
  }, [fontePontoB]);

  const handleFilter = (event) => {
    const { name, value } = event.target;
    // Quando o usuário muda a fonte de dados principal, reseta o filtro de calha
    if (name === 'fonte_dados') {
        onFilterChange({ fonte_dados: value, calha_rio: '' });
    } else {
        onFilterChange({ ...currentFilters, [name]: value });
    }
  };

  const handleCalculateClick = async () => {
    if (!pontoA || !pontoB) {
      alert("Por favor, selecione as localidades de Ponto A e Ponto B.");
      return;
    }
    // O endpoint de distância não existe no projeto original, vamos simular com a fórmula de Haversine
    // Se o endpoint real for /api/localidades/{id_a}/distance_to/{id_b}/, descomente o bloco de API
    /*
    try {
      const response = await api.get(`/localidades/${pontoA.id}/distance_to/${pontoB.id}/`);
      const distancia = response.data.distance_km;
    */
      // Simulação da fórmula de Haversine para cálculo de distância
      const R = 6371; // Raio da Terra em km
      const dLat = (pontoB.latitude - pontoA.latitude) * Math.PI / 180;
      const dLon = (pontoB.longitude - pontoA.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(pontoA.latitude * Math.PI / 180) * Math.cos(pontoB.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c; // Distância em km
    
      const tempoHoras = distancia / velocidade;
      const horas = Math.floor(tempoHoras);
      const minutos = Math.round((tempoHoras - horas) * 60);

      const result = {
        distancia: distancia.toFixed(2),
        velocidade: velocidade,
        tempo: `${horas}h ${minutos}min`
      };
      onCalculateRoute(pontoA, pontoB, result);
    /*
    } catch (error) {
      console.error("Erro ao calcular a distância:", error);
      alert("Não foi possível calcular a distância. Tente novamente.");
    }
    */
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Visualizar Localidades</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="fonte-dados-label">Fonte de Dados</InputLabel>
        <Select
          labelId="fonte-dados-label"
          name="fonte_dados"
          value={currentFilters.fonte_dados}
          label="Fonte de Dados"
          onChange={handleFilter}
        >
          <MenuItem value=""><em>Selecione uma fonte</em></MenuItem>
          <MenuItem value="3ª Tranche">3ª Tranche</MenuItem>
          <MenuItem value="Convencional">Convencional</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!currentFilters.fonte_dados}>
        <InputLabel id="calha-rio-label">Calha de Rio</InputLabel>
        <Select
          labelId="calha-rio-label"
          name="calha_rio"
          value={currentFilters.calha_rio}
          label="Calha de Rio"
          onChange={handleFilter}
        >
          <MenuItem value=""><em>Todas as Calhas</em></MenuItem>
          {calhas.map((calha) => (
            <MenuItem key={calha.id} value={calha.id}>{calha.nome}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="outlined" color="secondary" onClick={onClearFilters} fullWidth>
        Limpar Filtros e Mapa
      </Button>

      <Divider style={{ margin: '20px 0' }} />

      <Typography variant="h6" gutterBottom>Cálculo de Distância</Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="fonte-ponto-a-label">Fonte do Ponto A</InputLabel>
        <Select
          labelId="fonte-ponto-a-label"
          value={fontePontoA}
          label="Fonte do Ponto A"
          onChange={(e) => setFontePontoA(e.target.value)}
        >
          <MenuItem value=""><em>Selecione</em></MenuItem>
          <MenuItem value="3ª Tranche">3ª Tranche</MenuItem>
          <MenuItem value="Convencional">Convencional</MenuItem>
        </Select>
      </FormControl>
      <Autocomplete
        options={localidadesPontoA}
        getOptionLabel={(option) => `${option.nome_comunidade} (${option.municipio})`}
        value={pontoA}
        onChange={(event, newValue) => setPontoA(newValue)}
        loading={loadingA}
        disabled={!fontePontoA}
        renderInput={(params) => (
          <TextField {...params} label="Selecione o Ponto A"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>{loadingA ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>
              ),
            }}
          />
        )}
      />

      <FormControl fullWidth margin="normal" style={{ marginTop: 16 }}>
        <InputLabel id="fonte-ponto-b-label">Fonte do Ponto B</InputLabel>
        <Select
          labelId="fonte-ponto-b-label"
          value={fontePontoB}
          label="Fonte do Ponto B"
          onChange={(e) => setFontePontoB(e.target.value)}
        >
          <MenuItem value=""><em>Selecione</em></MenuItem>
          <MenuItem value="3ª Tranche">3ª Tranche</MenuItem>
          <MenuItem value="Convencional">Convencional</MenuItem>
        </Select>
      </FormControl>
      <Autocomplete
        options={localidadesPontoB}
        getOptionLabel={(option) => `${option.nome_comunidade} (${option.municipio})`}
        value={pontoB}
        onChange={(event, newValue) => setPontoB(newValue)}
        loading={loadingB}
        disabled={!fontePontoB}
        renderInput={(params) => (
          <TextField {...params} label="Selecione o Ponto B"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>{loadingB ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>
              ),
            }}
          />
        )}
      />

      <TextField
        label="Velocidade Média (km/h)" type="number" value={velocidade}
        onChange={(e) => setVelocidade(e.target.value)}
        fullWidth margin="normal"
      />

      <Button variant="contained" color="primary" onClick={handleCalculateClick} fullWidth>
        Calcular e Exibir no Mapa
      </Button>
    </Box>
  );
};

export default FilterPanel;