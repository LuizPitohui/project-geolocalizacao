// src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Drawer, Fab, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapComponent from '../components/MapComponent';
import FilterPanel from '../components/FilterPanel';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function formatarTempoViagem(horas) {
    if (horas === null || horas < 0) return '';
    const dias = Math.floor(horas / 24);
    const horasRestantes = Math.floor(horas % 24);
    const minutos = Math.round((horas * 60) % 60);
    let resultado = '';
    if (dias > 0) resultado += `${dias} dia(s) `;
    if (horasRestantes > 0) resultado += `${horasRestantes} hora(s) `;
    if (minutos > 0) resultado += `${minutos} minuto(s)`;
    return resultado.trim();
}

function DashboardPage() {
  const [map, setMap] = useState(null);
  const [pontosEmFoco, setPontosEmFoco] = useState(null);
  const [localidades, setLocalidades] = useState([]);
  const [todasLocalidades, setTodasLocalidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [pontoA, setPontoA] = useState('');
  const [pontoB, setPontoB] = useState('');
  const [distancia, setDistancia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [velocidadeMedia, setVelocidadeMedia] = useState(60);
  const [tempoViagem, setTempoViagem] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  useEffect(() => {
    const fetchAllLocalidades = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/localidades/', { params: { limit: 1000 } });
        const sortedData = response.data.sort((a, b) => a.comunidade.localeCompare(b.comunidade));
        setTodasLocalidades(sortedData);
        setLocalidades(sortedData);
      } catch (error) {
        console.error("Não foi possível carregar a lista de localidades.", error);
      }
    };
    fetchAllLocalidades();
  }, []);

  useEffect(() => {
    const resultadosFiltrados = todasLocalidades.filter(l =>
        l.comunidade.toLowerCase().includes(filtro.toLowerCase()) ||
        l.municipio.toLowerCase().includes(filtro.toLowerCase())
    );
    setLocalidades(resultadosFiltrados);
  }, [filtro, todasLocalidades]);

  const handleCalcularDistancia = () => {
    if (!pontoA || !pontoB) { alert('Selecione duas localidades.'); return; }
    setIsLoading(true);
    setDistancia(null);
    setTempoViagem(null);
    axios.post('http://localhost:8081/api/distancia/', { ponto_a_id: pontoA, ponto_b_id: pontoB })
      .then(response => {
        const dist = response.data.distancia_km;
        setDistancia(dist);
        if (dist && velocidadeMedia > 0) {
          setTempoViagem(formatarTempoViagem(dist / velocidadeMedia));
        }
        const localidadeA = todasLocalidades.find(l => l.id === Number(pontoA));
        const localidadeB = todasLocalidades.find(l => l.id === Number(pontoB));
        if (localidadeA && localidadeB && map) {
          setPontosEmFoco([localidadeA, localidadeB]);
          const bounds = L.latLngBounds([
            [localidadeA.latitude, localidadeA.longitude],
            [localidadeB.latitude, localidadeB.longitude]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      })
      .catch(error => alert('Não foi possível calcular a distância.'))
      .finally(() => setIsLoading(false));
  };
  
  // Esta é a função para limpar o foco e o resultado do cálculo
  const handleClearRota = () => {
    setPontosEmFoco(null);
    setDistancia(null);
    setTempoViagem(null);
    // Idealmente, limparíamos os campos do Autocomplete também
    if (map) {
      map.setView([-5.0, -62.0], 6);
    }
  };

  const pontosParaExibir = pontosEmFoco || localidades;
  const initialPosition = [-5.0, -62.0];

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
      <MapComponent 
        localidades={pontosParaExibir} 
        setMapInstance={setMap}
        pontosEmFoco={pontosEmFoco}
      />
      <Tooltip title="Abrir Filtros">
        <Fab 
          color="primary"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
          onClick={() => setIsPanelVisible(true)}
        >
          <FilterListIcon />
        </Fab>
      </Tooltip>
      <Drawer
        anchor="right"
        open={isPanelVisible}
        onClose={() => setIsPanelVisible(false)}
      >
        <FilterPanel 
          filtro={filtro}
          setFiltro={setFiltro}
          todasLocalidades={todasLocalidades}
          setPontoA={setPontoA}
          setPontoB={setPontoB}
          velocidadeMedia={velocidadeMedia}
          setVelocidadeMedia={setVelocidadeMedia}
          handleCalcularDistancia={handleCalcularDistancia}
          isLoading={isLoading}
          distancia={distancia}
          tempoViagem={tempoViagem}
          handleClearRota={handleClearRota}
        />
      </Drawer>
    </Box>
  );
}

export default DashboardPage;