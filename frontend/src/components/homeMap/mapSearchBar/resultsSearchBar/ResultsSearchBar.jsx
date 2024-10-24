import React from 'react';
import useNoScroll from "../../../../hooks/useNoScroll"
import "./resultssearchbar.css";

/**
 * Componente ResultsSearchBar: Se encarga de mostrar una lista de resultados de búsqueda de ubicaciones, un mensaje 
 * de error, o un mensaje de que no se encontraron resultados. Su estructura es la siguiente:
 * - resultsSearchMap: Contenedor general.
 * - itemsResultsSearchMap: Contenedor que permite organizar los resultados de la busqueda, y los mensajes de error
 *   y que no se encontraron resultados.
 * - liResults: Elemento que referencia a cada uno de los resultados obtenidos.
 * - liNotFound: Elemento que muestra el mensaje de no se encontraron resultados.
 * - liError: Elemento que muestra el mensaje de error.
 * - Por ultimo, se exporta "ResultsSearchBar" como componente.
 */
const ResultsSearchBar = ({ searchResults, notFoundResults, error, handleSelectLocation }) => {
 
  /** Estados y variables:
   * - resultsContainerRef: Se utiliza para crear una referencia al contenedor que muestra los resultados de búsqueda.
  */
  const resultsContainerRef = useNoScroll([searchResults]); 


  return (
    (searchResults.length > 0 || notFoundResults || error) && (
      <div ref={resultsContainerRef} className="resultsSearchMap">
        <ul className="itemsResultsSearchMap">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <li className='liResults' key={index} onClick={() => handleSelectLocation(result)}>
                {result.label}
              </li>
            ))
          ) : (
            <>
              {notFoundResults && <li className='liNotFound'>{notFoundResults}</li>}
              {error && <li className='liError'>{error}</li>}
            </>
          )}
        </ul>
      </div>
    )
  );
};


export default ResultsSearchBar;