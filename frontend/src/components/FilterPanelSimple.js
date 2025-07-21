// frontend/src/components/FilterPanelSimple.js

import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Divider, TextField } from '@mui/material';
import api from '../services/api';

const FilterPanelSimple = ({ calhas, onFilterChange, onCalculateRoute, onClearFilters, currentFilters }) => {
  
  const [localidadesPontoA, setLocalidadesPontoA] = useState([]);
  const [localidadesPontoB, setLocalidadesPontoB] = useState([]);
  const [fontePontoA, setFontePontoA] = useState('');
  const [fontePontoB, setFontePontoB] = useState('');
  const [pontoA, setPontoA] = useState(null);
  const [pontoB, setPontoB] = useState(null);
  const [velocidade, setVelocidade] = useState(60);

  const fetchLocalidadesPorFonte = async (fonte, setLocalidadesFunc) => {
    if (!fonte) {
      setLocalidadesFunc([]);
      return;
    }
    try {
      const response = await api.get(`/localidades/?fonte_dados=${fonte}&limit=2000`); 
      const simplifiedLocalidades = response.data.features.map(feature => ({
        id: feature.properties.id,
        nome_comunidade: feature.properties.nome_comunidade,
        municipio: feature.properties.municipio,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        ...feature.properties
      }));
      setLocalidadesFunc(simplifiedLocalidades);
    } catch (error) {
      console.error(`Erro ao buscar localidades da fonte ${fonte}:`, error);
    }
  };

  useEffect(() => {
    fetchLocalidadesPorFonte(fontePontoA, setLocalidadesPontoA);
    setPontoA(null);
  }, [fontePontoA]);

  useEffect(() => {
    fetchLocalidadesPorFonte(fontePontoB, setLocalidadesPontoB);
    setPontoB(null);
  }, [fontePontoB]);

  const handleFilter = (event) => {
    const { name, value } = event.target;
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
    
    // Cálculo de distância usando fórmula de Haversine
    const R = 6371; // Raio da Terra em km
    const dLat = (pontoB.latitude - pontoA.latitude) * Math.PI / 180;
    const dLon = (pontoB.longitude - pontoA.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(pontoA.latitude * Math.PI / 180) * Math.cos(pontoB.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
  
    const tempoHoras = distancia / velocidade;
    const horas = Math.floor(tempoHoras);
    const minutos = Math.round((tempoHoras - horas) * 60);

    const result = {
      distancia: distancia.toFixed(2),
      velocidade: velocidade,
      tempo: `${horas}h ${minutos}min`
    };
    onCalculateRoute(pontoA, pontoB, result);
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>Visualizar Localidades</Typography>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="fonte-dados" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Fonte de Dados
        </label>
        <select
          id="fonte-dados"
          name="fonte_dados"
          value={currentFilters.fonte_dados}
          onChange={handleFilter}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione uma fonte</option>
          <option value="3ª Tranche">3ª Tranche</option>
          <option value="Convencional">Convencional</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="calha-rio" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Calha de Rio
        </label>
        <select
          id="calha-rio"
          name="calha_rio"
          value={currentFilters.calha_rio}
          onChange={handleFilter}
          disabled={!currentFilters.fonte_dados}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: !currentFilters.fonte_dados ? '#f5f5f5' : 'white'
          }}
        >
          <option value="">Todas as Calhas</option>
          {calhas.map((calha) => (
            <option key={calha.id} value={calha.id}>{calha.nome}</option>
          ))}
        </select>
      </div>

      <Button variant="outlined" color="secondary" onClick={onClearFilters} fullWidth style={{ marginBottom: '20px' }}>
        Limpar Filtros e Mapa
      </Button>

      <Divider style={{ margin: '20px 0' }} />

      <Typography variant="h6" gutterBottom>Cálculo de Distância</Typography>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="fonte-ponto-a" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Fonte do Ponto A
        </label>
        <select
          id="fonte-ponto-a"
          value={fontePontoA}
          onChange={(e) => setFontePontoA(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione</option>
          <option value="3ª Tranche">3ª Tranche</option>
          <option value="Convencional">Convencional</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="ponto-a" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Selecione o Ponto A
        </label>
        <select
          id="ponto-a"
          value={pontoA?.id || ''}
          onChange={(e) => {
            const localidade = localidadesPontoA.find(l => l.id === parseInt(e.target.value));
            setPontoA(localidade || null);
          }}
          disabled={!fontePontoA}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: !fontePontoA ? '#f5f5f5' : 'white'
          }}
        >
          <option value="">Selecione uma localidade</option>
          {localidadesPontoA.map((localidade) => (
            <option key={localidade.id} value={localidade.id}>
              {localidade.nome_comunidade} ({localidade.municipio})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="fonte-ponto-b" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Fonte do Ponto B
        </label>
        <select
          id="fonte-ponto-b"
          value={fontePontoB}
          onChange={(e) => setFontePontoB(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          <option value="">Selecione</option>
          <option value="3ª Tranche">3ª Tranche</option>
          <option value="Convencional">Convencional</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="ponto-b" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Selecione o Ponto B
        </label>
        <select
          id="ponto-b"
          value={pontoB?.id || ''}
          onChange={(e) => {
            const localidade = localidadesPontoB.find(l => l.id === parseInt(e.target.value));
            setPontoB(localidade || null);
          }}
          disabled={!fontePontoB}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: !fontePontoB ? '#f5f5f5' : 'white'
          }}
        >
          <option value="">Selecione uma localidade</option>
          {localidadesPontoB.map((localidade) => (
            <option key={localidade.id} value={localidade.id}>
              {localidade.nome_comunidade} ({localidade.municipio})
            </option>
          ))}
        </select>
      </div>

      <TextField
        label="Velocidade Média (km/h)" 
        type="number" 
        value={velocidade}
        onChange={(e) => setVelocidade(e.target.value)}
        fullWidth 
        margin="normal"
      />

      <Button variant="contained" color="primary" onClick={handleCalculateClick} fullWidth>
        Calcular e Exibir no Mapa
      </Button>
    </Box>
  );
};

export default FilterPanelSimple;

