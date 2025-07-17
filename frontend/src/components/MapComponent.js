// src/components/MapComponent.js

import React, { useEffect, useCallback } from 'react';
// ALTERADO: Importamos mais hooks do react-leaflet
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { debounce } from 'lodash';

// O código do ícone continua o mesmo
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


// NOVO: Componente interno para lidar com os eventos do mapa
function MapEvents({ setLocalidades, searchFilter }) {
  const map = useMap();

  // NOVO: Função para buscar dados com debounce para não sobrecarregar a API
  const fetchVisibleLocalidades = useCallback(debounce(async (bounds, search) => {
    try {
      const params = {};
      // Se houver um filtro de busca, ele tem prioridade
      if (search) {
        params.search = search;
      } else { // Senão, usamos o bounding box
        params.in_bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ].join(',');
      }
      
      const response = await axios.get('http://localhost:8081/api/localidades/', { params });
      setLocalidades(response.data.results || response.data); // Suporta respostas paginadas e não paginadas

      // Se for uma busca, ajusta o zoom para os resultados
      if (search && response.data.length > 0) {
        const markersBounds = L.latLngBounds(response.data.map(l => [l.latitude, l.longitude]));
        if (markersBounds.isValid()) {
            map.fitBounds(markersBounds, { padding: [50, 50] });
        }
      }

    } catch (error) {
      console.error("Erro ao buscar localidades visíveis:", error);
    }
  }, 500), [map, setLocalidades]); // 500ms de debounce

  // NOVO: Efeito que dispara a busca quando o filtro de texto muda
  useEffect(() => {
    // Se o filtro de busca estiver ativo, busca por texto.
    if (searchFilter) {
      fetchVisibleLocalidades(null, searchFilter);
    } else {
      // Senão, busca o que está na tela.
      fetchVisibleLocalidades(map.getBounds(), null);
    }
  }, [searchFilter, fetchVisibleLocalidades, map]);

  // NOVO: Hook que escuta os eventos do mapa (arrastar, zoom)
  useMapEvents({
    dragend: () => fetchVisibleLocalidades(map.getBounds(), searchFilter),
    zoomend: () => fetchVisibleLocalidades(map.getBounds(), searchFilter),
  });

  return null; // Este componente não renderiza nada visualmente
}

// ALTERADO: O componente agora recebe um filtro de busca e gerencia seu próprio estado de localidades
function MapComponent({ setMapInstance, pontosEmFoco, setLocalidades, localidades, searchFilter }) {
  const initialPosition = [-5.0, -62.0];

  return (
    <MapContainer 
      ref={setMapInstance}
      center={initialPosition} 
      zoom={6} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* NOVO: Passamos a função de atualizar o estado e o filtro para o componente de eventos */}
      <MapEvents setLocalidades={setLocalidades} searchFilter={searchFilter} />

      {/* A lógica de renderizar os marcadores continua a mesma, mas agora com dados dinâmicos */}
      {localidades.map(localidade => (
        <Marker 
          key={localidade.id} 
          position={[localidade.latitude, localidade.longitude]}
        >
          <Popup>
            <div style={{ lineHeight: '2' }}>
              <strong>ID:</strong> {localidade.id}<br />
              <strong>Comunidade:</strong> {localidade.comunidade}<br />
              <strong>Município:</strong> {localidade.municipio} - {localidade.uf}<br />
              <strong>IBGE:</strong> {localidade.ibge}<br />
              <strong>Tipo:</strong> {localidade.tipo_comunidade}<br />
              <strong>Domicílios:</strong> {localidade.domicilios}<br />
              <strong>Total de Ligações:</strong> {localidade.total_ligacoes}<br />
              <hr style={{margin: '5px 0', border: 'none', borderTop: '1px solid #ddd'}}/>
              <strong>Latitude:</strong> {localidade.latitude}<br />
              <strong>Longitude:</strong> {localidade.longitude}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* A lógica da linha de distância não muda */}
      {pontosEmFoco && pontosEmFoco.length === 2 && (
        <Polyline 
          positions={[
            [pontosEmFoco[0].latitude, pontosEmFoco[0].longitude],
            [pontosEmFoco[1].latitude, pontosEmFoco[1].longitude],
          ]}
          color="blue" 
          weight={3} 
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}

export default MapComponent;