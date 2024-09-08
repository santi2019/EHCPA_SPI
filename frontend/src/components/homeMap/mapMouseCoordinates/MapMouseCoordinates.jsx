import React, { useEffect, useState, useRef} from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import "./mapmousecoordinates.css";
import L from 'leaflet';

const MapMouseCoordinates = ({isMouseOverSearch}) => {

    const [coordinates, setCoordinates] = useState({ lat: '0', lng: '0' });
    const [isMouseOverCoordinates, setIsMouseOverCoordinates] = useState(false);
    const elementRef = useRef(null);
    const map = useMap();   //Instancia del mapa react-leaflet

    

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





    /* Funcion GetCoordinatesHandler: Sirve para obentener las coordenadas del mouse, en el mapa,
                                      a medida que se desplaza sobre este ultimo. En el caso de 
                                      que el mouse se posicione sobre el contenedor y sobre los 
                                      span que muestran las coordenadas, asi como tambien en el 
                                      input del buscador y en la caja de resultados, el calculo se 
                                      detiene. 
    */
    const HandleGetCoordinates = () => {
        useMapEvents({
            mousemove(e) {
                if (!isMouseOverCoordinates && !isMouseOverSearch) {
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
            onMouseEnter={() => setIsMouseOverCoordinates(true)} 
            onMouseLeave={() => setIsMouseOverCoordinates(false)}  
            ref={elementRef}>
            <div className="coordinatesItems">
                <HandleGetCoordinates />
                <span className="coordinatesLatLng"> Lat: {coordinates.lat} Lng: {coordinates.lng}</span>
            </div>
        </div>
    );
};


export default MapMouseCoordinates;

