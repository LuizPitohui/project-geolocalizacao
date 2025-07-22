import React, { useState } from 'react';
import { Button, Box, Typography, Divider, TextField, Autocomplete } from '@mui/material';

// --- RECEBENDO AS NOVAS PROPS: pontoA, setPontoA, pontoB, setPontoB ---
const FilterPanelSimple = ({
  calhas,
  localidades,
  onFilterChange,
  onCalculateRoute,
  onClearFilters,
  currentFilters,
  routeResult,
  pontoA,
  setPontoA,
  pontoB,
  setPontoB
}) => {
  // O estado local para os pontos foi removido.
  const [velocidade, setVelocidade] = useState(60);

  // O useEffect que limpava os pontos foi removido,
  // pois essa lógica agora pertence ao DashboardPage.

  const handleFilter = (event) => {
    const { name, value } = event.target;
    if (name === 'fonte_dados') {
      onFilterChange({ fonte_dados: value, calha_rio: '' });
    } else {
      onFilterChange({ ...currentFilters, [name]: value });
    }
  };

  const handleCalculateClick = () => {
    if (!pontoA || !pontoB) {
      alert("Por favor, selecione as localidades de Ponto A e Ponto B.");
      return;
    }

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
        <label htmlFor="fonte-dados" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fonte de Dados</label>
        <select id="fonte-dados" name="fonte_dados" value={currentFilters.fonte_dados} onChange={handleFilter} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}>
          <option value="">Selecione uma fonte</option>
          <option value="3ª Tranche">3ª Tranche</option>
          <option value="Convencional">Convencional</option>
        </select>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="calha-rio" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Calha de Rio</label>
        <select id="calha-rio" name="calha_rio" value={currentFilters.calha_rio} onChange={handleFilter} disabled={!currentFilters.fonte_dados} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', backgroundColor: !currentFilters.fonte_dados ? '#f5f5f5' : 'white' }}>
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

      <Autocomplete
        options={localidades}
        getOptionLabel={(option) => `${option.nome_comunidade} (${option.municipio})`}
        // --- USANDO A PROP DO PAI ---
        value={pontoA}
        onChange={(event, newValue) => {
          setPontoA(newValue); // Atualiza o estado no componente pai
        }}
        disabled={localidades.length === 0}
        renderInput={(params) => (
          <TextField {...params} label="Ponto de Partida" margin="normal" />
        )}
        noOptionsText="Nenhuma localidade encontrada"
      />

      <Autocomplete
        options={localidades}
        getOptionLabel={(option) => `${option.nome_comunidade} (${option.municipio})`}
        // --- USANDO A PROP DO PAI ---
        value={pontoB}
        onChange={(event, newValue) => {
          setPontoB(newValue); // Atualiza o estado no componente pai
        }}
        disabled={localidades.length === 0}
        renderInput={(params) => (
          <TextField {...params} label="Ponto de Chegada" margin="normal" />
        )}
        noOptionsText="Nenhuma localidade encontrada"
      />

      <TextField label="Velocidade Média (km/h)" type="number" value={velocidade} onChange={(e) => setVelocidade(e.target.value)} fullWidth margin="normal" />
      <Button variant="contained" color="primary" onClick={handleCalculateClick} fullWidth>
        Calcular e Exibir no Mapa
      </Button>

      {routeResult && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="body1"><strong>Distância:</strong> {routeResult.distancia} km</Typography>
          <Typography variant="body1"><strong>Velocidade Média:</strong> {routeResult.velocidade} km/h</Typography>
          <Typography variant="body1"><strong>Tempo Estimado:</strong> {routeResult.tempo}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default FilterPanelSimple;