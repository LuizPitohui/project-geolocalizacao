// frontend/src/components/MapComponent.js

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Correção para o ícone padrão do Leaflet ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- Fim da correção do ícone ---


function MapController({ localities, routePoints }) {
  const map = useMap();

  useEffect(() => {
    // CORRIGIDO: Filtra localidades que têm latitude e longitude válidas
    const validLocalities = localities.filter(loc => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number');

    if (routePoints?.pontoA && routePoints?.pontoB) {
      const bounds = L.latLngBounds([
        [routePoints.pontoA.latitude, routePoints.pontoA.longitude],
        [routePoints.pontoB.latitude, routePoints.pontoB.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] }); 
    
    } else if (validLocalities.length > 0) {
      // CORRIGIDO: Usa o acesso direto a latitude e longitude
      const bounds = L.latLngBounds(validLocalities.map(loc => [loc.latitude, loc.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView([validLocalities[0].latitude, validLocalities[0].longitude], 10);
      }
    } else {
      map.setView([-4.5, -63], 5);
    }
  }, [localities, routePoints, map]); 

  return null;
}

const MapComponent = ({ localidades = [], routePoints = {}, routeResult = null }) => {
  const initialPosition = [-4.5, -63];
  const isRouteMode = routePoints.pontoA && routePoints.pontoB;

  return (
    <MapContainer center={initialPosition} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapController localities={localidades} routePoints={routePoints} />

      {isRouteMode ? (
        <>
          {/* Esta parte já estava correta e permanece a mesma */}
          <Marker position={[routePoints.pontoA.latitude, routePoints.pontoA.longitude]}>
            <Popup autoOpen> ... </Popup>
          </Marker>
          <Marker position={[routePoints.pontoB.latitude, routePoints.pontoB.longitude]}>
            <Popup autoOpen> ... </Popup>
          </Marker>
          <Polyline positions={[[routePoints.pontoA.latitude, routePoints.pontoA.longitude], [routePoints.pontoB.latitude, routePoints.pontoB.longitude]]} color="red">
            {routeResult && <Popup> ... </Popup>}
          </Polyline>
        </>
      ) : (
        // 👇 ESTA É A CORREÇÃO PRINCIPAL
        localidades
          // 1. Filtra por localidades que têm latitude e longitude
          .filter(localidade => localidade && typeof localidade.latitude === 'number' && typeof localidade.longitude === 'number')
          // 2. Mapeia usando o acesso direto às propriedades
          .map(localidade => {
            return (
              <Marker key={localidade.id} position={[localidade.latitude, localidade.longitude]}>
                <Popup>
                  <b>ID:</b> {localidade.id}<br/>
                  <b>Comunidade:</b> {localidade.nome_comunidade}<br/>
                  <b>Município:</b> {localidade.municipio}<br/>
                  <b>UF:</b> {localidade.uf}<br/>
                  <b>Fonte:</b> {localidade.fonte_dados}<br/>
                  <b>Calha:</b> {localidade.calha_rio || 'Não definida'}<br/>
                  <b>Domicílios/UCs:</b> {localidade.domicilios || 'N/A'}<br/>
                  <b>Total de Ligações:</b> {localidade.total_ligacoes || 'N/A'}
                </Popup>
              </Marker>
            );
          })
      )}
    </MapContainer>
  );
};

export default MapComponent;