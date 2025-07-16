// src/components/AutocompleteInput.js
import React from 'react';
import './AutocompleteInput.css';

function AutocompleteInput({
  placeholder,
  inputValue,
  setInputValue,
  suggestions,
  onSuggestionClick
}) {
  const handleClear = () => {
    setInputValue(''); // A função que limpa o campo
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {/* Renderiza o botão de limpar apenas se houver texto no input */}
      {inputValue && (
        <button onClick={handleClear} className="clear-button">
          &times; {/* Este é o caractere "X" de multiplicação */}
        </button>
      )}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => onSuggestionClick(suggestion)}>
              {suggestion.comunidade}, {suggestion.municipio}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocompleteInput;