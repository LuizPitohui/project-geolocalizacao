// frontend/src/components/FilterPanel.js

import React from 'react';
import AutocompleteInput from './AutocompleteInput';
import './FilterPanel.css';

function FilterPanel({
  // Props para o filtro de busca principal
  filtro,
  setFiltro,
  sugestoesBusca,
  onSuggestionClickBusca,
  
  // Props para o autocompletar do Ponto A
  buscaPontoA,
  setBuscaPontoA,
  sugestoesA,
  setPontoA,
  setSugestoesA,
  
  // Props para o autocompletar do Ponto B
  buscaPontoB,
  setBuscaPontoB,
  sugestoesB,
  setPontoB,
  setSugestoesB,
  
  // Props para a calculadora
  velocidadeMedia,
  setVelocidadeMedia,
  handleCalcularDistancia,
  isLoading,
  distancia,
  tempoViagem,

  // Prop para o botão de limpar tudo
  handleClearAllFilters,
}) {

  // Função para quando o usuário clica em uma sugestão para o Ponto A
  const handleSuggestionClickA = (suggestion) => {
    setBuscaPontoA(`${suggestion.comunidade}, ${suggestion.municipio}`);
    setPontoA(suggestion.id);
    setSugestoesA([]); // Limpa e esconde a lista de sugestões
  };
  
  // Função para quando o usuário clica em uma sugestão para o Ponto B
  const handleSuggestionClickB = (suggestion) => {
    setBuscaPontoB(`${suggestion.comunidade}, ${suggestion.municipio}`);
    setPontoB(suggestion.id);
    setSugestoesB([]);
  };

  return (
    <div className="filter-panel">
      {/* Seção de Busca Principal */}
      <div className="filter-section">
        <label>Buscar Localidade</label>
        <AutocompleteInput
          placeholder="Buscar na área do mapa..."
          inputValue={filtro}
          setInputValue={setFiltro}
          suggestions={sugestoesBusca}
          onSuggestionClick={onSuggestionClickBusca}
        />
      </div>

      {/* Seção da Calculadora de Rota */}
      <div className="filter-section">
        <label>Calculadora de Rota</label>
        
        <AutocompleteInput
          placeholder="Digite o Ponto A"
          inputValue={buscaPontoA}
          setInputValue={setBuscaPontoA}
          suggestions={sugestoesA}
          onSuggestionClick={handleSuggestionClickA}
        />
        <AutocompleteInput
          placeholder="Digite o Ponto B"
          inputValue={buscaPontoB}
          setInputValue={setBuscaPontoB}
          suggestions={sugestoesB}
          onSuggestionClick={handleSuggestionClickB}
        />
        
        <div className="speed-input">
          <input
            type="number"
            value={velocidadeMedia}
            onChange={e => setVelocidadeMedia(e.target.value)}
          />
          <span>km/h</span>
        </div>

        <button onClick={handleCalcularDistancia} disabled={isLoading}>
          {isLoading ? 'Calculando...' : 'Calcular Rota'}
        </button>
        
        {distancia !== null && (
          <div className="results-box">
            <p><strong>Distância:</strong> {distancia} km</p>
            <p><strong>Velocidade Média:</strong> {velocidadeMedia} km/h</p>
            <p><strong>Tempo Estimado:</strong> {tempoViagem}</p>
          </div>
        )}
      </div>

      {/* Seção do Botão de Limpar Tudo */}
      <div className="filter-section">
        <button onClick={handleClearAllFilters} className="clear-all-button">
          Limpar Todos os Filtros
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;