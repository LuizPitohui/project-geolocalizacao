// src/components/MapComponent.js

import React, { useEffect, useCallback } from 'react';
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


function MapEvents({ setLocalidades, searchFilter }) {
  const map = useMap();

  const fetchVisibleLocalidades = useCallback(debounce(async (bounds, search) => {
    try {
      const params = {};
      if (search) {
        params.search = search;
      } else {
        // A lógica de usar o IP manual no frontend deve ser ajustada aqui se necessário
        const ipCorreto = process.env.REACT_APP_API_URL || 'http://localhost:8081';
        params.in_bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ].join(',');
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8081'}/api/localidades/`, { params });
      setLocalidades(response.data.results || response.data);

      if (search && response.data.length > 0) {
        const markersBounds = L.latLngBounds(response.data.map(l => [l.latitude, l.longitude]));
        if (markersBounds.isValid()) {
            map.fitBounds(markersBounds, { padding: [50, 50] });
        }
      }

    } catch (error) {
      console.error("Erro ao buscar localidades visíveis:", error);
    }
  }, 500), [map, setLocalidades]);

  useEffect(() => {
    if (searchFilter) {
      fetchVisibleLocalidades(null, searchFilter);
    } else {
      fetchVisibleLocalidades(map.getBounds(), null);
    }
  }, [searchFilter, fetchVisibleLocalidades, map]);

  useMapEvents({
    dragend: () => fetchVisibleLocalidades(map.getBounds(), searchFilter),
    zoomend: () => fetchVisibleLocalidades(map.getBounds(), searchFilter),
  });

  return null;
}

function MapComponent({ setMapInstance, pontosEmFoco, setLocalidades, localidades, searchFilter }) {
  const initialPosition = [-5.0, -62.0]; // Posição em Manaus

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

      <MapEvents setLocalidades={setLocalidades} searchFilter={searchFilter} />

      {/* ALTERADO: Adicionamos este filtro para garantir que o mapa nunca tente renderizar uma localidade sem coordenadas. */}
      {localidades
        .filter(localidade => localidade.latitude != null && localidade.longitude != null)
        .map(localidade => (
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

      {/* A lógica da linha de distância não muda, mas adicionamos um filtro de segurança */}
      {pontosEmFoco && pontosEmFoco.length === 2 && pontosEmFoco.every(p => p.latitude != null && p.longitude != null) && (
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