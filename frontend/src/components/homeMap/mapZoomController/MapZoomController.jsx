import React, { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';
import "./mapzoomcontroller.css";

/*******************************************************************************************************************************************************/

/**
 * Componente MapZoomController: Permite visualizar las coordenadas del mouse, mientras se desplaza sobre el mapa, calculandose automaticamente. Su 
 * estructura es la siguiente:
 * - zoomControllerMap: Contenedor general.
 * - zoomInButton: Boton que permite aumentar el zoom en el mapa hasta 18, y al intentar superar dicho valor, el boton se deshabilita.
 * - zoomOutButton: Boton que permite remover el zoom en el mapa hasta 3, y al intentar superar dicho valor, el boton se deshabilita.
 * - Por ultimo, se exporta "MapZoomController" como componente.
*/

const MapZoomController = ({setIsMouseOverComponent}) => {

    /** Estados y variables:
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento referenciado.
     * - zoomLevel: Este estado inicializa su valor con el nivel de zoom actual del mapa, y mediante "setZoomLevel" actualizamos el valor de dicho 
     *   estado.
    */

    const elementRef = useRef(null);
    const map = useMap();
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel']);
    const [zoomLevel, setZoomLevel] = useState(map.getZoom());

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para actualizar el zoom del mapa cuando cambia el estado  de "zoomLevel", sincronizando el estado del componente 
     * con el mapa.
    */

    useEffect(() => {
        map.setZoom(zoomLevel);
    }, [zoomLevel, map]);

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para actualizar el estado de "zoomLevel" cada vez que el nivel de zoom del mapa cambia.
     * 1. Con "handleZoomEnd" actualizamos el estado "zoomLevel" con el nivel de zoom actual del mapa, entonces, cuando se termina de hacer zoom en el mapa, 
     *    se actualiza el estado.
     * 2. Limpiamos el evento al desmontar el componente.
    */ 

    useEffect(() => {
        const handleZoomEnd = () => {
            setZoomLevel(map.getZoom()); 
        };
        map.on('zoomend', handleZoomEnd);

        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map]);

    /*******************************************************************************************************************************************************/

    /** Funcion handleZoomIn: Sirve para aumentar el zoom en el mapa. 
     * 1. Se ejecuta cuando se hace click en el boton "zoomInButton". Cuando se termina de hacer zoom en el mapa, se actualiza el estado.
     * 2. Si el nivel de zoom es menor que 18 (nivel maximo de zoom in en Leaflet), al hacer click incrementamos el valor de "zoomLevel" en 1. Al cambiar 
     *    "zoomLevel", el mapa se actualiza automaticamente debido al primer "useEffect".
    */

    const handleZoomIn = () => {
        if (zoomLevel < 18) {
            setZoomLevel(zoomLevel + 1);  
        }
    };

    /*******************************************************************************************************************************************************/

    /** Funcion handleZoomOut: Sirve para disminuir el zoom en el mapa. 
     * 1. Se ejecuta cuando se hace click en el boton "zoomOutButton". Cuando se termina de hacer zoom en el mapa, se actualiza el estado.
     * 2. Si el nivel de zoom es mayor que 3 (nivel maximo de zoom out en Leaflet), al hacer click disminuimos el valor de "zoomLevel" en 1. Al cambiar 
     *    "zoomLevel", el mapa se actualiza automaticamente debido al primer "useEffect".
    */

    const handleZoomOut = () => {
        if (zoomLevel > 3) {
            setZoomLevel(zoomLevel - 1);  
        }
    };

    /*******************************************************************************************************************************************************/

    return (
        <div className="zoomControllerMap"
            ref={elementRef} 
            onMouseEnter={() => setIsMouseOverComponent(true)} 
            onMouseLeave={() => setIsMouseOverComponent(false)}>
                <button className={`zoomInButton ${zoomLevel === 18 ? 'disabled' : ''}`} onClick={handleZoomIn} disabled={zoomLevel === 18}>
                    <FontAwesomeIcon className="zoomInIcon" icon={faPlus} />
                </button>
                <button className={`zoomOutButton ${zoomLevel === 3 ? 'disabled' : ''}`} onClick={handleZoomOut} disabled={zoomLevel === 3}>
                    <FontAwesomeIcon className="zoomOutIcon" icon={faMinus} />
                </button>
        </div>
    );
};



export default MapZoomController;