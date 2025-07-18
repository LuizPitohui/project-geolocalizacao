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
    // Se temos pontos de rota (A e B), foca neles.
    if (routePoints?.pontoA && routePoints?.pontoB) {
      const bounds = L.latLngBounds([
        [routePoints.pontoA.latitude, routePoints.pontoA.longitude],
        [routePoints.pontoB.latitude, routePoints.pontoB.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] }); 
    
    // Se temos uma lista de localidades filtradas, foca em todas elas.
    } else if (localities && localities.length > 0) {
      const bounds = L.latLngBounds(localities.map(loc => [
        loc.geometry.coordinates[1], // Latitude
        loc.geometry.coordinates[0]  // Longitude
      ]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Se bounds não for válido (ex: apenas um ponto), apenas centraliza nele.
        map.setView([localities[0].geometry.coordinates[1], localities[0].geometry.coordinates[0]], 10);
      }
    } else {
      // Se não há dados, centraliza na visão geral do Amazonas.
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
          <Marker position={[routePoints.pontoA.latitude, routePoints.pontoA.longitude]}>
            <Popup autoOpen>
                <b>Ponto A: {routePoints.pontoA.nome_comunidade}</b><br/>
                <b>Município:</b> {routePoints.pontoA.municipio}<br/>
                <b>Fonte:</b> {routePoints.pontoA.fonte_dados}<br/>
                <b>Calha:</b> {routePoints.pontoA.calha_rio || 'Não definida'}<br/>
                <b>Domicílios/UCs:</b> {routePoints.pontoA.domicilios || 'N/A'}<br/>
                <b>Total de Ligações:</b> {routePoints.pontoA.total_ligacoes || 'N/A'}
            </Popup>
          </Marker>
          <Marker position={[routePoints.pontoB.latitude, routePoints.pontoB.longitude]}>
             <Popup autoOpen>
                <b>Ponto B: {routePoints.pontoB.nome_comunidade}</b><br/>
                <b>Município:</b> {routePoints.pontoB.municipio}<br/>
                <b>Fonte:</b> {routePoints.pontoB.fonte_dados}<br/>
                <b>Calha:</b> {routePoints.pontoB.calha_rio || 'Não definida'}<br/>
                <b>Domicílios/UCs:</b> {routePoints.pontoB.domicilios || 'N/A'}<br/>
                <b>Total de Ligações:</b> {routePoints.pontoB.total_ligacoes || 'N/A'}
            </Popup>
          </Marker>
          <Polyline 
            positions={[
              [routePoints.pontoA.latitude, routePoints.pontoA.longitude],
              [routePoints.pontoB.latitude, routePoints.pontoB.longitude]
            ]} 
            color="red"
          >
            {routeResult && (
              <Popup>
                <b>Distância:</b> {routeResult.distancia} km<br />
                <b>Velocidade Média:</b> {routeResult.velocidade} km/h<br />
                <b>Tempo Estimado:</b> {routeResult.tempo}
              </Popup>
            )}
          </Polyline>
        </>
      ) : (
        localidades.map(localidade => {
          const { properties, geometry } = localidade;
          const [lng, lat] = geometry.coordinates;

          return (
            <Marker key={properties.id} position={[lat, lng]}>
              <Popup>
                <b>ID:</b> {properties.id}<br/>
                <b>Comunidade:</b> {properties.nome_comunidade}<br/>
                <b>Município:</b> {properties.municipio}<br/>
                <b>UF:</b> {properties.uf}<br/>
                <b>Fonte:</b> {properties.fonte_dados}<br/>
                <b>Calha:</b> {properties.calha_rio || 'Não definida'}<br/>
                <b>Domicílios/UCs:</b> {properties.domicilios || 'N/A'}<br/>
                <b>Total de Ligações:</b> {properties.total_ligacoes || 'N/A'}
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
};

export default MapComponent;