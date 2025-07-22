import React, { useEffect } from 'react';
// Adiciona o LayersControl para alternar entre os mapas
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet';
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

// Componente auxiliar para controlar o zoom e a centralização do mapa
function MapController({ localities, routePoints }) {
  const map = useMap();

  useEffect(() => {
    const validLocalities = localities.filter(loc => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number');

    if (routePoints?.pontoA && routePoints?.pontoB) {
      const bounds = L.latLngBounds([
        [routePoints.pontoA.latitude, routePoints.pontoA.longitude],
        [routePoints.pontoB.latitude, routePoints.pontoB.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] }); 
    
    } else if (validLocalities.length > 0) {
      const bounds = L.latLngBounds(validLocalities.map(loc => [loc.latitude, loc.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (validLocalities.length === 1) {
        map.setView([validLocalities[0].latitude, validLocalities[0].longitude], 10);
      }
    } else {
      map.setView([-4.5, -63], 5);
    }
  }, [localities, routePoints, map]); 

  return null;
}

// Componente reutilizável para o conteúdo do popup
const PopupContent = ({ localidade }) => (
  <>
    <b>ID:</b> {localidade.id}<br/>
    <b>Comunidade:</b> {localidade.nome_comunidade}<br/>
    <b>Município:</b> {localidade.municipio}<br/>
    <b>UF:</b> {localidade.uf}<br/>
    <b>Fonte:</b> {localidade.fonte_dados}<br/>
    <b>Calha:</b> {localidade.calha_rio_nome || 'Não definida'}<br/>
    <b>Domicílios/UCs:</b> {localidade.domicilios || 'N/A'}<br/>
    <b>Total de Ligações:</b> {localidade.total_ligacoes || 'N/A'}
  </>
);

const MapComponent = ({ localidades = [], routePoints = {}, routeResult = null }) => {
  const initialPosition = [-4.5, -63];
  const isRouteMode = routePoints.pontoA && routePoints.pontoB;

  return (
    <MapContainer center={initialPosition} zoom={5} style={{ height: '100%', width: '100%' }}>
      
      {/* --- CONTROLE DE CAMADAS (LAYERS) --- */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Mapa de Rua">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer name="Satélite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            maxZoom={17}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {/* --- FIM DO CONTROLE DE CAMADAS --- */}

      <MapController localities={localidades} routePoints={routePoints} />

      {isRouteMode ? (
        // --- MODO DE ROTA ---
        <>
          <Marker position={[routePoints.pontoA.latitude, routePoints.pontoA.longitude]}>
            <Popup autoOpen>
              <PopupContent localidade={routePoints.pontoA} />
            </Popup>
          </Marker>

          <Marker position={[routePoints.pontoB.latitude, routePoints.pontoB.longitude]}>
            <Popup autoOpen>
              <PopupContent localidade={routePoints.pontoB} />
            </Popup>
          </Marker>
          
          <Polyline positions={[[routePoints.pontoA.latitude, routePoints.pontoA.longitude], [routePoints.pontoB.latitude, routePoints.pontoB.longitude]]} color="red">
            {routeResult && 
              <Popup>
                <b>Distância:</b> {routeResult.distancia} km<br/>
                <b>Velocidade Média:</b> {routeResult.velocidade} km/h<br/>
                <b>Tempo Estimado:</b> {routeResult.tempo}
              </Popup>
            }
          </Polyline>
        </>
      ) : (
        // --- MODO DE EXPLORAÇÃO ---
        localidades
          .filter(localidade => localidade && typeof localidade.latitude === 'number' && typeof localidade.longitude === 'number')
          .map(localidade => (
            <Marker key={localidade.id} position={[localidade.latitude, localidade.longitude]}>
              <Popup>
                <PopupContent localidade={localidade} />
              </Popup>
            </Marker>
          ))
      )}
    </MapContainer>
  );
};

export default MapComponent;