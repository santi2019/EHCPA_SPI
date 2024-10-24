import { useEffect } from 'react';


/** 
 * Hook useMapEventHandlers: Sirve para deshabilitar o bloquear cualquier tipo de evento del mapa, como el zoom, click o el 
 * dragging, al estar posicionado e interactuando con algun componente o elemento especifico, que este sobre el mapa.
 * Los parametros que recibe la funcion son los siguientes:
 * - elementRef: referencia de tipo "useRef" a un elemento para aplizar la funcion.
 * - map: instancia del mapa.
 * - events: arreglo de eventos que se quiere detectar. Entre ellos podemos tener:
 *      - mousedown: Detecta cuando se hace el primer click con el mouse, por ejemplo para seleccionar el texto.
 *      - mouseup: Detecta cuando se hace el segundo click con el mouse, siguiendo con el ejemplo, para deseleccionar el 
 *        texto, es decir, terminar con acciones que comenzaron con mousedown.
 *      - mousemove: Detecta dinamicamente la posicion del cursor del mouse.
 *      - wheel: Detecta dinamicamente cuando se mueve la rueda del mouse.
 *      - click: Detecta dinamicamente cuando se hace click izquierdo.
 * El funcionamiento de la funcion es el siguiente:
 * 1. Se accede al elemento que se está referenciando actualmente con "elementRef.current". 
 * 2. Si el elemento referenciado existe y el array de eventos no esta vacio, se recorre el arreglo y se agrega cada evento del
 *    mismo al elemento, mediante la función "L.DomEvent.on" que pertenece a la API de Leaflet y sirve para registrar listeners 
 *    en los elementos. Con "stopPropagation" evitamos que el evento registrado (como mousedown, wheel, etc) se propague mas 
 *    alla del elemento referenciado. 
 * 3. El "return" actua como una función de limpieza, o cleanup, que elimina todos los event listeners asociados al elemento 
 *    referenciado, cuando este se desmonta, se actualiza o simplemente cuando no nos encontramos interactuando sobre el.
 * 4. El array de dependencias asegura que el hook solo se vuelva a ejecutar cuando cambie la referencia del elemento, o si la 
 *    instancia del mapa cambia, o si los eventos que se quieren registrar o remover cambian
 * 5. Por ultimo, se exporta "HomeNavbar" como componente.
*/
const useMapEventHandlers = (elementRef, map, events = []) => {
    useEffect(() => {
      const element = elementRef.current;
  
      if (element && events.length > 0) {
        events.forEach((event) => {
          L.DomEvent.on(element, event, function (e) {
            L.DomEvent.stopPropagation(e);
          });
        });
      }
  
      return () => {
        if (element && events.length > 0) {
          events.forEach((event) => {
            L.DomEvent.off(element, event);
          });
        }
      };
    }, [elementRef, map, events]);
};


export default useMapEventHandlers;