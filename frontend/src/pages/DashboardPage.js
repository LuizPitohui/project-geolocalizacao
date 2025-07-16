// frontend/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import FilterPanel from '../components/FilterPanel';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './DashboardPage.css';

// Corrige um problema com os ícones padrão do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Função para formatar o tempo de viagem
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

// Componente para detectar eventos no mapa (clique, mover, zoom)
function MapEvents({ onBoundsChange, onMapClick }) {
  const map = useMapEvents({
    load: () => onBoundsChange(map.getBounds()),
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
    click: () => onMapClick(),
  });
  return null;
}


function DashboardPage() {
    // Dentro do componente DashboardPage, antes do return

const handleClearAllFilters = () => {
  // Limpa todos os estados dos filtros
  setFiltro('');
  setBuscaPontoA('');
  setBuscaPontoB('');
  setPontoA('');
  setPontoB('');
  setDistancia(null);
  setTempoViagem(null);
  setSugestoesBusca([]);
  setSugestoesA([]);
  setSugestoesB([]);

  // Reseta a visualização do mapa para a posição inicial
  if (map) {
    map.setView(initialPosition, 6); // initialPosition e o zoom inicial
  }
};
  // Estado para a referência do mapa
  const [map, setMap] = useState(null);

  // Estados para o mapa e filtros
  const [localidades, setLocalidades] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [bounds, setBounds] = useState(null);
  const [sugestoesBusca, setSugestoesBusca] = useState([]);
  
  // Estado para a lista completa de localidades (para autocompletar)
  const [todasLocalidades, setTodasLocalidades] = useState([]);

  // Estados para a calculadora de distância
  const [pontoA, setPontoA] = useState('');
  const [pontoB, setPontoB] = useState('');
  const [distancia, setDistancia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [velocidadeMedia, setVelocidadeMedia] = useState(60);
  const [tempoViagem, setTempoViagem] = useState(null);

  // Estados para os campos de autocompletar da calculadora
  const [buscaPontoA, setBuscaPontoA] = useState('');
  const [buscaPontoB, setBuscaPontoB] = useState('');
  const [sugestoesA, setSugestoesA] = useState([]);
  const [sugestoesB, setSugestoesB] = useState([]);

  // Estado para o painel de filtros
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Efeito para buscar localidades com base na área do mapa e no filtro de texto
  useEffect(() => {
    if (!bounds) return;
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    const termoDeBusca = filtro.length > 1 ? filtro : '';
    const apiUrl = `http://localhost:8081/api/localidades/?in_bbox=${bbox}&search=${termoDeBusca}`;
    
    axios.get(apiUrl)
      .then(response => {
        setLocalidades(response.data);
        if (termoDeBusca) {
          setSugestoesBusca(response.data);
        } else {
          setSugestoesBusca([]);
        }
      })
      .catch(error => console.error("Erro ao buscar dados da área do mapa!", error));
  }, [bounds, filtro]);

  // Efeito para buscar TODAS as localidades uma única vez para os filtros
  useEffect(() => {
    const fetchAllLocalidades = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/localidades/', { params: { limit: 1000 } });
        const sortedData = response.data.sort((a, b) => a.comunidade.localeCompare(b.comunidade));
        setTodasLocalidades(sortedData);
      } catch (error) {
        console.error("Não foi possível carregar a lista completa de localidades.", error);
      }
    };
    fetchAllLocalidades();
  }, []);

  // Efeito para gerar sugestões para o Ponto A
  useEffect(() => {
    if (buscaPontoA.length > 1) {
      const sugestoesFiltradas = todasLocalidades.filter(l =>
        l.comunidade.toLowerCase().includes(buscaPontoA.toLowerCase()) ||
        l.municipio.toLowerCase().includes(buscaPontoA.toLowerCase())
      ).slice(0, 10);
      setSugestoesA(sugestoesFiltradas);
    } else {
      setSugestoesA([]);
    }
  }, [buscaPontoA, todasLocalidades]);

  // Efeito para gerar sugestões para o Ponto B
  useEffect(() => {
    if (buscaPontoB.length > 1) {
      const sugestoesFiltradas = todasLocalidades.filter(l =>
        l.comunidade.toLowerCase().includes(buscaPontoB.toLowerCase()) ||
        l.municipio.toLowerCase().includes(buscaPontoB.toLowerCase())
      ).slice(0, 10);
      setSugestoesB(sugestoesFiltradas);
    } else {
      setSugestoesB([]);
    }
  }, [buscaPontoB, todasLocalidades]);

  // Lógica para calcular a distância
  const handleCalcularDistancia = () => {
    if (!pontoA || !pontoB) {
      alert('Por favor, selecione duas localidades.');
      return;
    }
    setIsLoading(true);
    setDistancia(null);
    setTempoViagem(null);
    axios.post('http://localhost:8081/api/distancia/', {
      ponto_a_id: pontoA,
      ponto_b_id: pontoB
    })
    .then(response => {
      const dist = response.data.distancia_km;
      setDistancia(dist);
      if (dist && velocidadeMedia > 0) {
        const tempoEmHoras = dist / velocidadeMedia;
        setTempoViagem(formatarTempoViagem(tempoEmHoras));
      }
    })
    .catch(error => {
        console.error("Erro ao calcular distância!", error)
        alert('Não foi possível calcular a distância.');
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  // Lógica para centralizar o mapa ao clicar na sugestão da busca principal
  const handleSuggestionClickBusca = (localidade) => {
    if (map) {
      map.setView([localidade.latitude, localidade.longitude], 13);
    }
    setFiltro(localidade.comunidade);
    setSugestoesBusca([]);
  };

  const initialPosition = [-5.0, -62.0];

  return (
    <div className="dashboard-page-layout">
      <div className="map-container-wrapper">
        <button className="toggle-filters-button" onClick={() => setIsPanelVisible(!isPanelVisible)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        </button>
        <MapContainer whenCreated={setMap} center={initialPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
          {localidades.map(l => <Marker key={l.id} position={[l.latitude, l.longitude]}><Popup><strong>{l.comunidade}</strong><br/>{l.municipio}</Popup></Marker>)}
          <MapEvents onBoundsChange={setBounds} onMapClick={() => setIsPanelVisible(false)} />
        </MapContainer>
      </div>
      
      {isPanelVisible && (
        <FilterPanel
          // Props para o filtro de busca principal
          filtro={filtro}
          setFiltro={setFiltro}
          sugestoesBusca={sugestoesBusca}
          onSuggestionClickBusca={handleSuggestionClickBusca}
          
          // Props para o autocompletar do Ponto A
          buscaPontoA={buscaPontoA}
          setBuscaPontoA={setBuscaPontoA}
          sugestoesA={sugestoesA}
          setPontoA={setPontoA}
          setSugestoesA={setSugestoesA}
          
          // Props para o autocompletar do Ponto B
          buscaPontoB={buscaPontoB}
          setBuscaPontoB={setBuscaPontoB}
          sugestoesB={sugestoesB}
          setPontoB={setPontoB}
          setSugestoesB={setSugestoesB}
          
          // Props para a calculadora
          velocidadeMedia={velocidadeMedia}
          setVelocidadeMedia={setVelocidadeMedia}
          handleCalcularDistancia={handleCalcularDistancia}
          isLoading={isLoading}
          distancia={distancia}
          tempoViagem={tempoViagem}
        />
      )}
    </div>
  );
}

export default DashboardPage;