import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents, Tooltip  } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css";
import 'leaflet-geoserver-request';
import "./homemap.css";
import MapMouseCoordinates from './mapMouseCoordinates/MapMouseCoordinates';
import MapSearchBar from './mapSearchBar/MapSearchBar';
import MapZoomController from './mapZoomController/MapZoomController';
import MapScaleController from './mapScaleController/MapScaleController';
import MapReferenceLayers from './mapReferenceLayers/MapReferenceLayers';
import MapMenu from './mapMenu/MapMenu';

/*******************************************************************************************************************************************************/

/**
 * Componente HomeMap: Su estructura es la siguiente:
 * - homeMap: Contenedor general.
 * - MapContainer: Contenedor principal de react-leaflet que define el área del mapa, en el cual se define la posicion inicial de centrado, el zoom
 *   inicial, los limites de Zoom In y Zoom Out, se desactiva la marca de agua de leaflet, se desactiva el control de zoom predeterminado de leaflet, 
 *   y se desactiva el zoom con doble click en el mapa.
 * - TileLayer: Capa de fondo del mapa que carga las imágenes de fondo de un servicio de mapas. Mediante "url" se establece la URL del servicio de mapas 
 *   que proporciona las imágenes del fondo, que en este caso es el servicio de "Argenmap", y se obtiene de una variable de entorno.
 * - MapMenu: Instancia del menu para manejar las capas de PTM, SPI, visualizar el modal informativo y descargar los archivos.
 * - MapReferenceLayers: Instancia del boton para manejar las capas de referencia.
 * - MapZoomController: Instancia de los botones para manejar el zoom del mapa.
 * - MapScaleController: Instancia del contenedor que refleja la escala del mapa dependiendo del zoom.
 * - MapMouseCoordinates: Instancia del contenedor que refleja las coordenadas del mouse conforme se mueve en el mapa.
 * - MapSearchBar: Instancia de la barra de busqueda de ubicaciones.
 * - Por ultimo, se exporta "HomeMap" como componente.
*/

const HomeMap = () => { 

    /** Estados y variables:
     * - centerCoordinates: Establece las coordenadas iniciales para centrar el mapa.
     * - markerPosition: Estado que representa la posición del marker en el mapa, y mediante "setMarkerPosition" se actualiza el valor de la posicion.
     * - zoom: Establece el zoom inicial que tendra el mapa.
     * - minZoom: Establece el maximo valor de Zoom Out.
     * - maxZoom: Establece el maximo valor de Zoom In.
     * - attributionControlValue: Representa la marca de agua de leaflet, la cual se setea como "false" para no mostrarla.
     * - temporaryCoordinates: Se utiliza para centrar el mapa al seleccionar una ubicacion del buscador, en sus correspondientes coordenadas. Mediante
     *   "setTemporaryCoordinates" se actualizan las coordenadas conforme se selecciona una ubicacion diferente.
     * - temporaryZoom: Se utiliza para aplicar Zoom In o Zoom Out en el mapa dependiendo del tipo de ubicacion seleccionada al ejecutar el buscador. Y 
     *   mediante "setTemporaryZoom" se actualiza el zoom conforme se selecciona una ubicacion diferente.
     * - shouldCenterMap: Se utiliza para indicar si se debe centrar el mapa cuando se setea un nuevo valor en "temporaryCoordinates".
     * - isMouseOverComponent: Estado utilizado para determinar si el mouse esta sobre un componente o elmento referenciado.
     * - markerTooltipContent: Estado que se utiliza para almacenar contenido del texto de la ubicacion seleccionada en el buscador para que sea mostrado
     *   en el tooltip del marker, cuando este ultimo sea colocado en el mapa al seleccionar la ubicacion. Y mediante  "setMarkerTooltipContent" actualizamos 
     *   el valor del tooltip.
    */

    const centerCoordinates = {lat: '-32.4146', lng:'-63.1821'}
    const [markerPosition, setMarkerPosition] = useState(null);
    const zoom = 7
    const minZoom = 3 
    const maxZoom = 18
    const attributionControlValue = false 
    const [temporaryCoordinates, setTemporaryCoordinates] = useState(null)
    const [temporaryZoom, setTemporaryZoom] = useState();
    const [shouldCenterMap, setShouldCenterMap] = useState(false);
    const [isMouseOverComponent, setIsMouseOverComponent] = useState(false);
    const [markerTooltipContent, setMarkerTooltipContent] = useState(null);
    
    /*******************************************************************************************************************************************************/

    /** 
     * Función handleSelectLocation: Sirve para configurar las coordenadas, zoom y centrado del mapa, y la colocacion del marker y asignacion del contenido 
     * del tooltip del mismo, cuando se selecciona una ubicación.
     * 1. La funcion recibe "result" como parametro, el cual es un objeto con información sobre una ubicación seleccionada.
     * 2. Como primera medida se comprueba que el objeto "result" contiene coordenadas X y Y (latitud y longitud) válidas. De ser asi se asignan a los 
     *    valores de dichas coordenadas al estado "temporaryCoordinates" almacenanando las coordenadas de la ubicación seleccionada. Ademas, se establece la 
     *    posición del marker en el mapa usando las mismas coordenadas. Tambien se setea como contenido del tooltip, el valor del "label" o texto de la 
     *    ubicacion seleccionada. Por ultimo, seteamos en "true" el estado "shouldCenterMap" para indicar que el mapa se debe centrar en la ubicacion 
     *    seleccionada.
     * 3. Por ultimo, dependiendo del rango del lugar (place_rank) y del ripo de direccion (addresstype) de la ubicacion seleccionada, se va a setear el 
     *    correspondiente zoom que luego se aplicara en el mapa, actualizando el valor del mismo mediante "setTemporaryZoom".
    */

    const handleSelectLocation = (result) => {

        if (result.y && result.x) { 
            setTemporaryCoordinates({lat: result.y, lng: result.x});
            setMarkerPosition([result.y, result.x]);
            setMarkerTooltipContent(result.label); 
            setShouldCenterMap(true);
        }
        
        if(result.raw.place_rank==4 && result.raw.addresstype=="country"){ //Country (Pais)
            setTemporaryZoom(4);
        }

        if(result.raw.place_rank>=5 && result.raw.place_rank<=9 && result.raw.addresstype=="state"){ // State (Provincia)
            setTemporaryZoom(6);
            if(result.raw.name=="Ciudad Autónoma de Buenos Aires"){
                setTemporaryZoom(10);
            }
        }

        if(result.raw.place_rank>=10 && result.raw.place_rank<=11){
            if(result.raw.addresstype=="state_district"){  // Departamento
                setTemporaryZoom(8);
            }
            if(result.raw.addresstype=="county"){  // Condado
                setTemporaryZoom(12);
            }
            else{
                setTemporaryZoom(10);
            }
        }

        if(result.raw.place_rank>=12 && result.raw.place_rank<=16){ // Town, o City District (Ciudad o Capitales) 
            setTemporaryZoom(12);
    
            if(result.raw.addresstype=="town"){
                setTemporaryZoom(13);
            }
            if(result.raw.addresstype=="village" ){
                setTemporaryZoom(15);
            }
        }

        if(result.raw.place_rank>=17 && result.raw.place_rank<=18){    // Borough (Distrito)
            setTemporaryZoom(16);

            if(result.raw.addresstype=="town" || result.raw.addresstype=="quarter"){
                setTemporaryZoom(18);
            }
        }

        if(result.raw.place_rank>=19 && result.raw.place_rank<=21){   // Villa y Suburb (Suburbio)
            setTemporaryZoom(16);

            if(result.raw.addresstype=="suburb" ){
                setTemporaryZoom(17);
            }
            if(result.raw.addresstype=="neighbourhood" ){ // Neighbourhood (Barrio o Country)
                setTemporaryZoom(18);
            }
        }

        if(result.raw.place_rank==22){  // Neighbourhood (Barrio o Country) 
            if(result.raw.addresstype=="military" || result.raw.addresstype=="residential"){   // Base milirar o Residencia
                setTemporaryZoom(17);
            }else{
                setTemporaryZoom(18);
            } 
        }

        if(result.raw.place_rank>=23 && result.raw.place_rank<=25){  // Municipio, Vecindario 
            setTemporaryZoom(16);
        }      

        if(result.raw.place_rank>=26){ // Roads (Rutas), Streets (Calles), House Number (Numero de Casas), Offices (Oficinas) o Buildings (Edificios)
            setTemporaryZoom(18);
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion CenterMap: Sirve para redirigir y centrar el mapa cuando cambian las coordenadas, y aplicar el correspondiente zoom.
     * 1. La funcion recibe "center" como parametro, en donde a dicha variable se le asigna previamente el valor de "temporaryCoordinates".
     * 2. La funcion "useMap()" nos proporciona acceso a la instancia de mapa de Leaflet actual, permitiendonos interactuar con el mapa y usar métodos como 
     *    "flyTo" para centrarlo en ciertas coordenadas.
     * 3. La funcion "useEffect" es un hook de React que ejecuta el código dentro de él cada vez que cambian los valores en su lista de dependencias, que en 
     *    este caso son "center", "temporaryZoom" y "map". Dentro de la funcion se verifica que:
     *    - Si el estado "shouldCenterMap" es "true", indicando que el mapa debe centrarse, y si "center" existe y a su vez tiene valores válidos para lat y 
     *      lng, entonces se llama al metodo "flyTo" para mover el mapa suavemente a las nuevas coordenadas, actualizando ademas el nivel de zoom con el valor
     *      de "temporaryZoom" actualizado. Y una vez centrado el mapa, se establece a "shouldCenterMap" en "false" para evitar que se vuelva a centrar 
     *      automáticamente en el siguiente renderizado o cambio de estado del mapa.
     * 4. Como la funcion no renderiza ningún contenido visual, retorna "null".
    */

    const CenterMap = ({ center }) => {
        const map = useMap();
        
        useEffect(() => {
            if (shouldCenterMap && center && center.lat && center.lng) {
                map.flyTo([center.lat, center.lng], temporaryZoom);
                setShouldCenterMap(false);
            }
        }, [center, temporaryZoom, map]);

        return null;
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion MapMarkerClick: Sirve para colocar un marker en la posición donde el usuario hace click en el mapa, siempre que el mouse no esté sobre un
     * componente o elemento referenciado.
     * 1. La funcion recibe "isMouseOverComponent" como parametro, para determinar si el mouse esta sobre un componente o elemento referenciado, o no.
     * 2. Se llama a "useMapEvents" para registrar eventos en el mapa. En este caso, se usa para manejar el evento de click, que ocurre cuando se hace click
     *    en cualquier lugar del mapa. Cuando se hace click, se verifica si el valor de "isMouseOverComponent" es "false" para asegurarnos que el marker
     *    se coloque unicamente sobre el mapa y no sobre los elementos referenciados. En caso de que esto se cumpla, se crea un nuevo array "newMarkerPosition"
     *    con las coordenadas exactas de lat y lng en el mapa de donde se hizo el click en el mapa, y con "setMarkerPosition" se actualiza el estado de
     *    "markerPosition" para que el marker se coloque en las coordenadas especificadas. Y por otro lado se limpia cualquier contenido del tooltip, ya que 
     *    no la imformacion sobre el punto se muestra en el dragg modal.
     * 4. Como la funcion no renderiza ningún contenido visual, retorna "null".
    */

    const MapMarkerClick = ({ isMouseOverComponent }) => {
        useMapEvents({
            click(e) {
                if (!isMouseOverComponent) { 
                    const newMarkerPosition = [e.latlng.lat, e.latlng.lng];
                    setMarkerPosition(newMarkerPosition);
                    setMarkerTooltipContent(null);
                }
            }
        });

        return null;  
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleRemoveMarker: Sirve para remover el marker cuando se hace click sobre el.
     * 1. Se setea el valor de "markerPosition" en "null" para eliminar el marker del mapa.
     * 2. Se setea el valor de "markerTooltipContent" en "null" para borrar el contenido del tooltip del marker. 
    */

    const handleRemoveMarker = () => {
        setMarkerPosition(null);  
        setMarkerTooltipContent(null);
    };

    /*******************************************************************************************************************************************************/

    return(
        <div className='homeMap'>            
            <MapContainer className="leaflet-container" 
                center={centerCoordinates}  
                zoom={zoom} minZoom={minZoom} maxZoom={maxZoom}
                attributionControl={attributionControlValue}
                zoomControl={false}
                doubleClickZoom={false}>
                <TileLayer
                    //attribution={import.meta.env.VITE_OSM_ATTRIBUTION}
                    url={import.meta.env.VITE_ARGEN_MAP_URL}
                />
                <MapMenu setIsMouseOverComponent={setIsMouseOverComponent} isMouseOverComponent={isMouseOverComponent}/>
                <MapReferenceLayers setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapZoomController setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapScaleController setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapMouseCoordinates setIsMouseOverComponent={setIsMouseOverComponent} isMouseOverComponent={isMouseOverComponent}/>
                <MapSearchBar handleSelectLocation={handleSelectLocation} setIsMouseOverComponent={setIsMouseOverComponent}/>
                <CenterMap center={temporaryCoordinates} zoom={temporaryZoom} />
                <MapMarkerClick isMouseOverComponent={isMouseOverComponent}/>
                {markerPosition && (
                    <Marker
                        position={markerPosition}
                        eventHandlers={{
                            click: handleRemoveMarker 
                        }}
                    >
                        {markerTooltipContent && (
                            <Tooltip direction="top" opacity={1} offset={[-15.5, -12]} permanent>
                                {markerTooltipContent}
                            </Tooltip>
                        )}                    
                    </Marker>
                )}
            </MapContainer >
        </div>
    );
};




export default HomeMap

