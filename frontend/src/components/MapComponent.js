// src/components/MapComponent.js

import React from 'react';
// Importa os componentes do react-leaflet que vamos usar
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
// Importa o CSS padrão do Leaflet para que o mapa seja renderizado corretamente
import 'leaflet/dist/leaflet.css';
// Importa o objeto 'L' do Leaflet para correções de ícone e outras funcionalidades
import L from 'leaflet';

// Bloco de código que corrige um problema comum de exibição dos ícones de marcador no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// O componente recebe 3 props do seu "pai" (DashboardPage):
// - localidades: A lista de pontos a serem exibidos no mapa.
// - setMapInstance: Uma função para "devolver" a referência do mapa para o pai.
// - pontosEmFoco: Um array com 2 localidades para o modo de foco da calculadora, ou null.
function MapComponent({ localidades, setMapInstance, pontosEmFoco }) {
  
  // Define a posição inicial e o zoom do mapa
  const initialPosition = [-5.0, -62.0]; // Centralizado na Amazônia

  return (
    // O MapContainer é o componente principal que cria o elemento do mapa
    <MapContainer 
      // A prop 'ref' é a forma moderna de dar acesso à instância do mapa.
      // Quando o mapa é criado, ele chama a função 'setMapInstance' com sua própria referência.
      ref={setMapInstance}
      center={initialPosition} 
      zoom={6} 
      style={{ height: '100%', width: '100%' }}
    >
      {/* TileLayer é a camada de imagem do mapa (o "fundo"). Usamos o OpenStreetMap. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Percorre a lista de 'localidades' para criar os marcadores */}
      {localidades.map(localidade => (
        <Marker 
          // A 'key' é um identificador único que o React precisa para listas
          key={localidade.id} 
          // A posição do marcador usa a latitude e longitude da localidade
          position={[localidade.latitude, localidade.longitude]}
        >
          {/* Este é o popup que abre ao clicar em um marcador */}
          <Popup>
            {/* Usamos uma div com um pouco de estilo para melhorar a leitura */}
            <div style={{ lineHeight: '2' }}>
              <strong>ID:</strong> {localidade.id}<br />
              <strong>Comunidade:</strong> {localidade.comunidade}<br />
              <strong>Município:</strong> {localidade.municipio} - {localidade.uf}<br />
              <strong>IBGE:</strong> {localidade.ibge}<br />
              <strong>Tipo:</strong> {localidade.tipo_comunidade}<br />
              <strong>Domicílios:</strong> {localidade.domicilios}<br />
              <strong>Total de Ligações:</strong> {localidade.total_ligacoes}<br />
              {/* <hr> cria uma linha divisória para separar os dados geográficos */}
              <hr style={{margin: '5px 0', border: 'none', borderTop: '1px solid #ddd'}}/>
              <strong>Latitude:</strong> {localidade.latitude}<br />
              <strong>Longitude:</strong> {localidade.longitude}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Lógica para desenhar a linha do cálculo de distância */}
      {/* Só renderiza o componente Polyline se 'pontosEmFoco' tiver exatamente 2 localidades */}
      {pontosEmFoco && pontosEmFoco.length === 2 && (
        <Polyline 
          // Define as posições de início e fim da linha
          positions={[
            [pontosEmFoco[0].latitude, pontosEmFoco[0].longitude],
            [pontosEmFoco[1].latitude, pontosEmFoco[1].longitude],
          ]}
          // Estilo da linha
          color="blue" 
          weight={3} 
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}

export default MapComponent;