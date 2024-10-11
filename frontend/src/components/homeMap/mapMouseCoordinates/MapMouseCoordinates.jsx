import React, { useState, useRef} from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import "./mapmousecoordinates.css";
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';


/**
 * Componente MapMouseCoordinates: Permite visualizar las coordenadas del mouse, mientras se desplaza 
 * sobre el mapa, calculandose automaticamente. Su estructura es la siguiente:
 * - coordinatesMap: Contenedor general.
 * - coordinatesItems: Contenedor que se utiliza para estructurar el contenido que permite desde la 
 *   obtencion de las coordenadas hasta la visualizacion de las mismas.
 * - coordinatesLatLng: Texto para visualizar las coordendas resultantes de la funcion "HandleGetCoordinates".
 * - Por ultimo, se exporta "MapMouseCoordinates" como componente.
*/
const MapMouseCoordinates = ({isMouseOverComponent, setIsMouseOverComponent}) => {

    /** Estados y variables:
     * - coordinates: Este estado inicializa las coordenadas en 0, y se utiliza "setCoordinates" para
     *   actualizar el valor de las coordenadas conforme el mouse se mueva sobre el mapa.
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento
     *   referenciado.
     */
    const [coordinates, setCoordinates] = useState({ lat: '0', lng: '0' });
    const elementRef = useRef(null);
    const map = useMap();  
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel', 'click']);


    /**
     * Funcion HandleGetCoordinates: Sirve para obentener las coordenadas del mouse a medida que se
     * desplaza sobre el mapa.
     * 1. Antes de actualizar las coordenadas, se verifica:
     *    - Si el mouse no esta sobre un componente especifico determinado por "isMouseOverComponent" 
     *      el cálculo de las coordenadas se detiene.
     *    - Caso contrario, se actualizan las coordenadas (lat, lng) con las posiciones actuales del
     *      mouse, redondeando los valores a 3 decimales.
     * 2. La función no necesita devolver ningun componente visual, por lo que retorna null.
    */
    const HandleGetCoordinates = () => {
        useMapEvents({
            mousemove(e) {
                if (!isMouseOverComponent) {
                    setCoordinates({
                        lat: e.latlng.lat.toFixed(3),
                        lng: e.latlng.lng.toFixed(3),
                    });
                }
            },
        });
        return null;
    };



    return (
        <div className="coordinatesMap"
            ref={elementRef} 
            onMouseEnter={() => setIsMouseOverComponent(true)} 
            onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="coordinatesItems">
                <HandleGetCoordinates />
                <span className="coordinatesLatLng"> Lat: {coordinates.lat} - Lng: {coordinates.lng}</span>
            </div>
        </div>
    );
};


export default MapMouseCoordinates;
