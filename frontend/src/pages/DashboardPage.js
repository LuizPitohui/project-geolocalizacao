// frontend/src/pages/DashboardPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import MapComponent from '../components/MapComponent';
import FilterPanelSimple from '../components/FilterPanelSimple';
import api from '../services/api';

// Componente principal que organiza a página do dashboard
function DashboardPage() {
  // Estado para armazenar a lista de calhas de rios vinda da API
  const [calhas, setCalhas] = useState([]);
  
  // Estado para armazenar as localidades a serem exibidas no mapa
  const [localidades, setLocalidades] = useState([]);

  // Estado que guarda os valores atuais dos filtros
  const [filters, setFilters] = useState({
    fonte_dados: '', // '3ª Tranche' ou 'Convencional'
    calha_rio: ''    // ID da calha selecionada
  });

  // Estado para os pontos do cálculo de rota
  const [routePoints, setRoutePoints] = useState({
    pontoA: null,
    pontoB: null
  });

  // Estado para o resultado do cálculo de distância
  const [routeResult, setRouteResult] = useState(null);

  // Busca a lista de calhas de rios uma vez, quando o componente é montado
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
  }, []); // O array vazio [] garante que rode apenas na montagem

  // Função para buscar localidades da API com base nos filtros
  const fetchLocalidades = useCallback(async () => {
    // A busca só é feita se uma fonte de dados for selecionada
    if (!filters.fonte_dados) {
      setLocalidades([]); // Garante que o mapa fique vazio sem filtro
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('fonte_dados', filters.fonte_dados);
      if (filters.calha_rio) {
        params.append('calha_rio', filters.calha_rio);
      }
      
      // Aumentamos o limite para garantir que todos os dados sejam retornados
      const response = await api.get(`/localidades/?limit=2000&${params.toString()}`);
      console.log('Dados recebidos da API:', response.data);
      setLocalidades(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar localidades:", error);
      setLocalidades([]);
    }
  }, [filters]); // A função será recriada se o estado 'filters' mudar

  // Este efeito "escuta" por mudanças nos filtros e chama a função de busca
  useEffect(() => {
    // Quando o filtro muda, limpamos qualquer rota que estivesse sendo exibida
    setRoutePoints({ pontoA: null, pontoB: null });
    setRouteResult(null);
    fetchLocalidades();
  }, [fetchLocalidades]); // A dependência é a função `fetchLocalidades`

  // Função para atualizar o estado dos filtros, chamada pelo FilterPanel
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Função para lidar com o cálculo de rota
  const handleCalculateRoute = (pontoA, pontoB, result) => {
    setLocalidades([]); // Limpa as localidades filtradas para focar na rota
    setRoutePoints({ pontoA, pontoB });
    setRouteResult(result);
  };
  
  // Função para limpar tudo e voltar ao estado inicial
  const handleClearFilters = () => {
    setFilters({ fonte_dados: '', calha_rio: '' });
    setRoutePoints({ pontoA: null, pontoB: null });
    setRouteResult(null);
    setLocalidades([]); 
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', padding: 2 }}>
      {/* --- Coluna da Esquerda (Filtros) --- */}
      <Paper 
        elevation={3} 
        sx={{ 
          width: '400px', // Largura fixa para o painel
          padding: 2, 
          marginRight: 2,
          overflowY: 'auto' // Barra de rolagem se o conteúdo for grande
        }}
      >
        <h2>Filtros e Análise</h2>
        <FilterPanelSimple
          calhas={calhas}
          onFilterChange={handleFilterChange}
          onCalculateRoute={handleCalculateRoute}
          onClearFilters={handleClearFilters}
          currentFilters={filters}
        />
      </Paper>

      {/* --- Coluna da Direita (Mapa) --- */}
      <Paper 
        elevation={3}
        sx={{ 
          flex: 1, // Faz o mapa ocupar todo o espaço restante
          width: '100%',
          height: '100%'
        }}
      >
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