import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import MapComponent from '../components/MapComponent';
import FilterPanelSimple from '../components/FilterPanelSimple';
import api from '../services/api';

function DashboardPage() {
  const [calhas, setCalhas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [filters, setFilters] = useState({
    fonte_dados: '',
    calha_rio: ''
  });
  
  // --- ESTADO DOS PONTOS A E B MOVIDO PARA CÁ ---
  const [pontoA, setPontoA] = useState(null);
  const [pontoB, setPontoB] = useState(null);

  const [routePoints, setRoutePoints] = useState({
    pontoA: null,
    pontoB: null
  });
  const [routeResult, setRouteResult] = useState(null);

  useEffect(() => {
    const fetchCalhas = async () => {
      try {
        const response = await api.get('/calhas/');
        setCalhas(response.data);
      } catch (error) {
        console.error("Erro ao buscar calhas:", error);
      }
    };
    fetchCalhas();
  }, []);

  const fetchLocalidades = useCallback(async () => {
    if (!filters.fonte_dados) {
      setLocalidades([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('fonte_dados', filters.fonte_dados);
      if (filters.calha_rio) {
        params.append('calha_rio', filters.calha_rio);
      }
      const response = await api.get(`/localidades/?limit=2000&${params.toString()}`);
      setLocalidades(response.data.results || response.data || []);
    } catch (error) {
      console.error("Erro ao buscar localidades:", error);
      setLocalidades([]);
    }
  }, [filters]);

  useEffect(() => {
    // Limpa a rota e os pontos selecionados quando o filtro principal muda
    setRoutePoints({ pontoA: null, pontoB: null });
    setRouteResult(null);
    setPontoA(null);
    setPontoB(null);
    fetchLocalidades();
  }, [fetchLocalidades]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCalculateRoute = (calculatedPontoA, calculatedPontoB, result) => {
    // --- MUDANÇA PRINCIPAL ---
    // A lista de localidades NÃO é mais limpa.
    // Apenas definimos os pontos para desenhar a rota no mapa.
    setRoutePoints({ pontoA: calculatedPontoA, pontoB: calculatedPontoB });
    setRouteResult(result);
  };

  const handleClearFilters = () => {
    setFilters({ fonte_dados: '', calha_rio: '' });
    setRoutePoints({ pontoA: null, pontoB: null });
    setRouteResult(null);
    setLocalidades([]);
    // Limpa também os campos de Autocomplete
    setPontoA(null);
    setPontoB(null);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', padding: 2 }}>
      <Paper elevation={3} sx={{ width: '400px', padding: 2, marginRight: 2, overflowY: 'auto' }}>
        <h2>Filtros e Análise</h2>
        <FilterPanelSimple
          calhas={calhas}
          localidades={localidades}
          onFilterChange={handleFilterChange}
          onCalculateRoute={handleCalculateRoute}
          onClearFilters={handleClearFilters}
          currentFilters={filters}
          routeResult={routeResult}
          // --- PASSANDO O ESTADO E OS SETTERS PARA O COMPONENTE FILHO ---
          pontoA={pontoA}
          setPontoA={setPontoA}
          pontoB={pontoB}
          setPontoB={setPontoB}
        />
      </Paper>
      <Paper elevation={3} sx={{ flex: 1, width: '100%', height: '100%' }}>
        <MapComponent
          localidades={localidades}
          routePoints={routePoints}
          routeResult={routeResult}
        />
      </Paper>
    </Box>
  );
}

export default DashboardPage;