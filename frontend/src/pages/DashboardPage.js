// src/pages/DashboardPage.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Drawer, Fab, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapComponent from '../components/MapComponent';
import FilterPanel from '../components/FilterPanel';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { debounce } from 'lodash';

// A função de formatar tempo continua a mesma
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
  
  // ALTERADO: Este estado agora guarda apenas as localidades VISÍVEIS no mapa
  const [localidades, setLocalidades] = useState([]);
  
  // ALTERADO: Este estado continua guardando a lista de NOMES para os filtros
  const [todasLocalidades, setTodasLocalidades] = useState([]);
  
  const [filtro, setFiltro] = useState('');
  const [debouncedFiltro, setDebouncedFiltro] = useState('');

  const [pontoA, setPontoA] = useState('');
  const [pontoB, setPontoB] = useState('');
  const [distancia, setDistancia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [velocidadeMedia, setVelocidadeMedia] = useState(60);
  const [tempoViagem, setTempoViagem] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  // ALTERADO: Este useEffect agora busca apenas os NOMES das localidades
  useEffect(() => {
    const fetchLocalidadeNomes = async () => {
      try {
        // Usamos o novo endpoint super leve
        const response = await axios.get('http://localhost:8081/api/localidades-nomes/');
        setTodasLocalidades(response.data); // A resposta não é paginada
      } catch (error) {
        console.error("Não foi possível carregar a lista de nomes de localidades.", error);
      }
    };
    fetchLocalidadeNomes();
  }, []);

  // NOVO: Efeito para aplicar debounce na busca por texto
  const debouncedSetFiltro = useCallback(debounce((value) => {
    setDebouncedFiltro(value);
  }, 500), []); // 500ms de espera

  useEffect(() => {
    debouncedSetFiltro(filtro);
  }, [filtro, debouncedSetFiltro]);


  // REMOVIDO: O useEffect de filtro no lado do cliente foi removido. A lógica agora está no MapComponent.

  const handleCalcularDistancia = () => {
    if (!pontoA || !pontoB) {
      alert('Selecione duas localidades.');
      return;
    }
    setIsLoading(true);
    setDistancia(null);
    setTempoViagem(null);
    
    // A chamada axios não muda
    axios.post('http://localhost:8081/api/distancia/', { ponto_a_id: pontoA, ponto_b_id: pontoB })
      .then(response => {
        const dist = response.data.distancia_km;
        setDistancia(dist);
        if (dist && velocidadeMedia > 0) {
          setTempoViagem(formatarTempoViagem(dist / velocidadeMedia));
        }

        const localidadeA = todasLocalidades.find(l => l.id === Number(pontoA));
        const localidadeB = todasLocalidades.find(l => l.id === Number(pontoB));

        // A verificação de segurança, agora que temos as coordenadas
        if (localidadeA && localidadeB && localidadeA.latitude && localidadeB.latitude && map) {
          
          // NOVO: Limpamos os marcadores de exploração do mapa
          setLocalidades([]); 
          
          // Agora definimos os pontos em foco, que serão os únicos no mapa
          setPontosEmFoco([localidadeA, localidadeB]);

          const bounds = L.latLngBounds([
            [localidadeA.latitude, localidadeA.longitude],
            [localidadeB.latitude, localidadeB.longitude]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // Caso não encontre as localidades ou as coordenadas, mostramos um alerta
          alert("Não foi possível encontrar as coordenadas para focar no mapa.");
        }
      })
      .catch(error => {
        // O catch agora trata erros de rede ou do back-end
        console.error("Erro ao calcular distância:", error);
        alert('Erro no servidor ao calcular a distância.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleClearRota = () => {
    setPontosEmFoco(null);
    setDistancia(null);
    setTempoViagem(null);
    // IMPORTANTE: Ao limpar a rota, precisamos que o mapa volte a buscar as localidades da área visível.
    // A forma mais fácil é pedir ao MapComponent para recarregar.
    // Como não temos um comando direto, podemos simplesmente resetar o mapa.
    // O MapComponent já tem lógica para buscar dados quando o mapa se move.
    if (map) {
      map.setView([-5.0, -62.0], 6);
    }
  };

  // A variável pontosParaExibir agora tem uma lógica mais explícita
  const pontosParaExibir = pontosEmFoco ? pontosEmFoco : localidades;

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
      <MapComponent 
        // ALTERADO: Passamos as props necessárias para a nova lógica
        localidades={pontosParaExibir} 
        setLocalidades={setLocalidades}
        setMapInstance={setMap}
        pontosEmFoco={pontosEmFoco}
        searchFilter={debouncedFiltro} // O filtro com debounce
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
          todasLocalidades={todasLocalidades} // A lista leve de nomes continua aqui
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