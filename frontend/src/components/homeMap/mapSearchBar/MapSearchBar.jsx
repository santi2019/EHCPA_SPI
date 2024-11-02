import React, { useState, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion} from "@fortawesome/free-regular-svg-icons";
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';
import ResultsSearchBar from './resultsSearchBar/ResultsSearchBar';
import InfoSearchBar from './infoSearchBar/InfoSearchBar';
import "./mapsearchbar.css";

/*******************************************************************************************************************************************************/

/**
 * Componente MapSearchBar: Permite realizar busquedas de ubicaciones.
 * - searchMap: Contenedor general.
 * - itemsSearchMap: Formulario que se utiliza para estructurar el contenido que permite desde la busqueda de ubicaciones, como asi tambien organizar 
 *   los iconos de informacion del buscador y de limpiar la busqueda.
 * - inputSearchMap: Barra que permite ingresar la ubicacion a buscar.
 * - iconsSearchMap: Contenedor que organiza los diferentes iconos de la barra de busqueda, como lo son el icono de lupa, que permite realizar la busqueda, 
 *   el icono de interrogacion que permite abrir el modal de "Información del Buscador", y el icono de "X" para limpiar la busqueda.
 * - ResultsSearchBar: Modal que muestra los resultados de la busqueda, como asi tambien los mensajes de error.
 * - InfoSearchBar: Modal informativo que explica el funcionamiento del buscador.
 * - Por ultimo, se exporta "MapSearchBar" como componente.
*/

const MapSearchBar = ({ handleSelectLocation, setIsMouseOverComponent  }) => { 
    
     /** Estados y variables:
     * - searchValue: Estado que almacena el valor de la busqueda actual, y mediante "setSearchValue" se actualiza al mismo.
     * - searchResults: Arreglo que almacena los resultados de la búsqueda, y mediante "setSearchResults" se guardan los mismos.
     * - error: Representa un mensaje de error en caso de que ocurra un fallo en la búsqueda. Como el error en este caso es conocido, se setea el 
     *   mensaje del mismo mediante "setError".
     * - notFoundResults: Representa un mensaje de cuando no hay resultados, y el mismo se setea mediante "setNotFoundResults".
     * - isInfoModalOpen: Estado para controlar si el modal de "Información del Buscador" esta abierto o no, y mediante "setIsInfoModalOpen" determinamos 
     *   el valor del mismo.
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - provider: El siguiente buscador utiliza como motor de busqueda a "Nominatim", servicio que utiliza los datos del proyecto colaborativo 
     *   OpenStreetMap, y que permite tanto la "geocodificación", es decir, convertir direcciones o descripciones de lugares en coordenadas geográficas, 
     *   como asi también la "geocodificación inversa", en donde se convierten coordenadas geográficas en descripciones de ubicaciones. Podemos acceder 
     *   al provedor de dicha API gracias a la libreria leaflet-geosearch. Y se le aplican ciertos filtros, como lo son en este caso, litar los resultados 
     *   de busqueda para Argentina unicamente, y evitar que se retenga el zoom.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento referenciado.
    */
   
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [notFoundResults, setNotFoundResults] = useState("");
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const elementRef = useRef(null);
    const map = useMap();  
    const provider = new OpenStreetMapProvider({
        params: { 
            countrycodes: 'AR',
            retainZoomLevel: false
        }
      });
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel']);

    /*******************************************************************************************************************************************************/

    /** Funcion handleFormSubmit: Sirve para evitar recargar la pagina web, al apretar la tecla "Enter" o el icono de la lupa, luego de escribir algo en el 
     *  input, enviando su contenido a traves del formulario. 
     *  1. Al apretar la tecla "Enter" o el icono de la lupa, se llama a la funcion "handleSearch".
    */

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(); 
    };

    /*******************************************************************************************************************************************************/

    /** Funcion handleSearchValue: Sirve para actualizar el valor de búsqueda en el estado cada vez que se escribe algo.
     *  1. Dado el valor ingresado en el input, el mismo se guarda y luego se actualiza el estado "SearchValue", y de esta manera se actualiza todo el tiempo 
     *     el valor de lo que se escribe y envia como contenido de busqueda en el input, como parametro de busqueda. 
     *  2. Por otro lado, en caso de que no exista o se borre el contenido del input, ya sea manualmente o mediante el icono "X", se hara desaparecer la caja 
     *     de resultados, y se setean vacios los mensajes de error y de que no se obtuvieron resultados.
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

    /*******************************************************************************************************************************************************/
    
    /** Funcion handleSearch: Sirve para buscar y mostrar las ubicaciones existentes, en base a lo ingresado como parametro de busqueda en la funcion 
     *  "handleSearchValue".
     *  1. En caso de que exista un valor de busqueda:
     *      - Se establece un delay para evitar la sobrecarga de consultas al servicio OSM.
     *      - El resultado que se obtiene es un JSON, producto de la consulta al provider, que combina el servidor de busqueda OSM con sus parametros (el 
     *        filtro de AR en este caso) con el valor de la busqueda introducido en el input. Y los resultados se almacenan en el arreglo "SearchResults".
     *      - En caso de que la longitud del resultado de la busqueda sea 0, significa que la ubicacion ingresada no existe, y por ende se muestra que no se 
     *        encontraron resultados.
     *      - Ante un error en el servidor, se muestra el mensaje.
     *  2. Al finalizar la consulta se resetea el delay.
     *  3. En el caso de que no exista un valor de busqueda, se borra la caja de resultados, y se setean vacios los mensajes de error y de que no se obtuvieron 
     *     resultados.
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
                    console.log(err)
                    const serverErrorMessage = "Fallo en la conexión con el servidor de OSM."
                    setError(serverErrorMessage);
                }
            }, 1200);
            return () => clearTimeout(delay);
        } else {
            setSearchResults([]);
            setNotFoundResults("");
            setError(null);
        }

    };

    /*******************************************************************************************************************************************************/

    /** Funcion handleClearSearch: Sirve para limpiar el contenido del input de busqueda, hacer desaparecer la caja de resultados, o hacer desaparecer los 
     *  mensajes de error o de que no se obtuvieron resultados, cuando se selecciona el icono de "X".
     * 1. Se setean vacios o "null" todos los estados.
    */

    const handleClearSearch = () => {
        setSearchValue('');
        setSearchResults([]);
        setNotFoundResults('');
        setError(null)
    };

    /*******************************************************************************************************************************************************/
    
    /** Funcion handleOpenInfoModal: Sirve para manjar la apertura del modal de "Información del Buscador".
     *  1. Al llamar la funcion se setea el estado "isInfoModalOpen" como "true".
    */

    const handleOpenInfoModal = () => {
        setIsInfoModalOpen(true);
    };

    /*******************************************************************************************************************************************************/

    /** Funcion handleCloseInfoModal: Sirve para manjar el cierre del modal de "Información del Buscador".
     *  1. Directamente actualizamos el valor de "IsInfoModalOpen" a "false" para ocultar el modal.
     *  2. Al setear "false" en "setIsMouseOverComponent" indicamos que el mouse ya no está sobre ese componente, en este caso el modal.
    */

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setIsMouseOverComponent(false)
    };

    /*******************************************************************************************************************************************************/
    
    return(
        <div ref={elementRef} onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="searchMap">
                <form className='itemsSearchMap' autoComplete="none" onSubmit={handleFormSubmit}>
                    <input className="inputSearchMap" type="text" placeholder="Buscar" value={searchValue} onChange={handleSearchValue} />
                    <div className="iconsSearchMap">
                        <FontAwesomeIcon className="searchIcon" icon={faMagnifyingGlass} onClick={handleSearch}/>
                        <FontAwesomeIcon className="questionIcon" icon={faCircleQuestion} onClick={handleOpenInfoModal}/>
                        {searchValue && (
                            <FontAwesomeIcon className="deleteIcon" icon={faCircleXmark} onClick={handleClearSearch}/>
                        )}
                    </div>
                </form>                
            </div>
            <ResultsSearchBar
                searchResults={searchResults}
                notFoundResults={notFoundResults}
                error={error}
                handleSelectLocation={handleSelectLocation}
            />
            {isInfoModalOpen && (
                <InfoSearchBar 
                handleCloseInfoModal={handleCloseInfoModal}
                setIsMouseOverComponent={setIsMouseOverComponent}
                /> 
            )}
        </div>
    );
};


export default MapSearchBar
