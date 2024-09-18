import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, ScaleControl, useMap } from 'react-leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faCircleInfo, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion} from "@fortawesome/free-regular-svg-icons";
import "./mapsearchbar.css";

const MapSearchBar = ({ handleSelectLocation, setIsMouseOverComponent  }) => { 
    
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [notFoundResults, setNotFoundResults] = useState("");
    const elementRef = useRef(null);
    const map = useMap();   //Instancia del mapa react-leaflet
    const provider = new OpenStreetMapProvider({
        params: { countrycodes: 'AR' }
      });


   
    /* Funcion useEffect: Sirve para evitar el zoom y el dragging al posicionarse tanto en 
                          el div, como en el span que contiene las coordenadas. En caso de 
                          que el mouse se posicione en los elementos referenciados, se activan
                          los listeners de eventos, que evitan que los eventos del mapa como 
                          el drag y el zoom, interfieran con la seleccion del texto de las 
                          coordenadas. Cuando el mouse hace click en el mapa, desactiva los
                          listeners. Esto se refleja en la instancia del mapa a traves de "map". 
                          - mousedown: Detecta cuando se hace el primer click con el mouse, por
                                      ejemplo para seleccionar el texto.
                          - mouseup: Detecta cuando se hace el segundo click con el mouse, siguiendo
                                      con el ejemplo, para deseleccionar el texto, es decir, terminar
                                      con acciones que comenzaron con mousedown.
                          - mousemove: Detecta dinamicamente la posicion del cursor del mouse. Y se 
                                      activa cuando se mueve sobre un elemento, como lo son, en este
                                      caso, el contenedor y el span de las coordenadas.
                          - wheel: Detecta dinamicamente cuando se mueve la rueda del mouse. Y se 
                                  activa cuando se la intenta mover sobre los elementos referenciados.
        */
        useEffect(() => {
            const element = elementRef.current;
            
            if (element) {
                L.DomEvent.on(element, 'mousedown', function (event) {
                    L.DomEvent.stopPropagation(event);
                });
                L.DomEvent.on(element, 'mouseup', function (event) {
                    L.DomEvent.stopPropagation(event);
                });
                L.DomEvent.on(element, 'mousemove', function (event) {
                    L.DomEvent.stopPropagation(event);
                });
                L.DomEvent.on(element, 'wheel', function (event) {
                    L.DomEvent.stopPropagation(event);
                });
            }
    
            return () => {
                if (element) {
                    L.DomEvent.off(element, 'mousedown');
                    L.DomEvent.off(element, 'mouseup');
                    L.DomEvent.off(element, 'mousemove');
                    L.DomEvent.off(element, 'wheel');
                }
            };
        }, [map]);





    /* Funcion handleSearchValue: Sirve, por un lado, para guardar y actualizar el valor de 
                                  lo que se escribe y envia como contenido de busqueda en el 
                                  input, como parametro de busqueda. Por otro lado, en caso 
                                  de que no exista o se borre el contenido del input ya sea 
                                  manualmente o mediante el icono "X", se hara desaparecer la
                                  caja de resultados o mensajes de error.
    */
    const handleSearchValue = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (!value) {
            setSearchResults([]);
            setNotFoundResults("");
            setError(null);
        }
    };
    




    /*Funcion handleSearch: Sirve para buscar y mostrar las ubicaciones existentes, en base a lo 
                            ingresado como parametro de busqueda en la funcion handleSearchValue().
                            - Se establece un delay para evitar la sobrecarga de consultas al servidor
                              OSM.
                            - El resultado es un JSON, producto de la consulta al provider, que combina
                              el servidor de busqueda OSM con sus parametros (el filtro de AR en este
                              caso) con el valor de la busqueda introducido en el input.
                            - En caso de que la longitud del resultado de la busqueda sea 0, significa
                              que la ubicacion ingresada no existe.
                            - Ante un error, se muestra el mensaje dependiendo el tipo.
                            - Al finalizar la consulta se resetea el delay.
                            - Y en el caso de que no exista un valor de consulta, se borra la caja de 
                              resultados y mensajes de error.
    */
    const handleSearch = () => {
        if (searchValue) {
            const delay = setTimeout(async () => {
                try {
                    const results = await provider.search({ query: searchValue });
                    setSearchResults(results);

                    if (results.length === 0) {
                        const notFoundMessage = "No se encontraron resultados en la busqueda."
                        setNotFoundResults(notFoundMessage)
                    } 
                } catch (err) {
                    const osmServerErrorMessage = "Falla en el servidor de OSM."
                    setError(osmServerErrorMessage);
                }
            }, 1200);
            return () => clearTimeout(delay);
        } else {
            setSearchResults([]);
            setNotFoundResults("");
            setError(null);
        }

    };
    




    /* Funcion handleClearSearch: sirve para borrar el contenido del input y hacer desaparecer 
                                  la caja de resultados o mensajes de error al apretar el icono 
                                  de "X".
    */
    const handleClearSearch = () => {
        setSearchValue('');
        setSearchResults([]);
        setNotFoundResults('');
        setError(null)
    };





    /* Funcion handleFormSubmit: sirve para evitar recargar la pagina web, al apretar la tecla 
                                 "Enter" luego de escribir algo en el input, enviando su contenido
                                 a traves del formulario. En lugar de eso, al apretar la tecla 
                                 "Enter" se llama a la funcion handleSearch().
    */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(); 
    };


    
    
    return(
        <div ref={elementRef}>
            <div className="searchMap" onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
                <form className='searchMapForm' autoComplete="none" onSubmit={handleFormSubmit}>
                    <input className="inputSearchMap" type="text" placeholder="Buscar" value={searchValue} onChange={handleSearchValue} />
                    <div className="inputItems">
                        <FontAwesomeIcon className="searchIcon" icon={faMagnifyingGlass} onClick={handleSearch}/>
                        <FontAwesomeIcon className="questionIcon" icon={faCircleQuestion} />
                        {searchValue && (
                        <FontAwesomeIcon className="deleteIcon" icon={faCircleXmark} onClick={handleClearSearch}/>
                        )}
                    </div>
                </form>                
            </div>
            {(searchResults.length > 0 || notFoundResults || error) && (
                <div className="resultsSearchMap" onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
                    <ul>
                        {searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <li className='liResults' key={index} onClick={() => handleSelectLocation(result)}>
                                    {result.label}
                                </li>
                            ))
                        ):(
                            <>
                                {notFoundResults && <li className='liNotFound'>{notFoundResults}</li>}
                                {error && <li className='liError'>{error}</li>}
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};



export default MapSearchBar

