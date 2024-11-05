import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';
import "./mapscalecontroller.css";

/*******************************************************************************************************************************************************/

/**
 * Componente MapScaleControl: Permite visualizar la escala del mapa a medida que se realiza el zoom in  o zoom out. Su estructura es la siguiente:
 * - scaleControllerMap: Contenedor general.
 * - scaleControllerItem: Contenedor que se utiliza para visualizar el efecto dinamico de expancion y reduccion del mismo, al cambiar el valor de la 
 *   escala del mapa. El estilo "width: ${scaleWidth}px" establece el ancho del contenedor en píxeles basado en el estado "scaleWidth", que se ajusta 
 *   automáticamente cuando el tamaño del texto de la escala cambia.
 *   - scaleValue: Texto que renderiza el valor de la escala del mapa en el momento.
 * - Por ultimo, se exporta "MapScaleControl" como componente.
*/

const MapScaleControl = ({ setIsMouseOverComponent }) => {

    /** Estados y variables:
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - scaleValueRef: Se utiliza para crear una referencia al span donde se muestra el valor de la escala, y lo utilizamos para obtener su ancho.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - scaleLabel: Estado que almacena la escala actual del mapa, y mediante "setScaleLabel" se setea o actualiza su valor.
     * - scaleWidth: Estado que gestiona el ancho del contenedor "scaleControllerItem", en pixeles. Se inicializa con 50 para asegurar que, incluso 
     *   antes de que el texto de la escala sea medido por el "ResizeObserver", el contenedor "scaleControllerItem" tendra al menos un tamaño basico. 
     *   Esto ayuda a prevenir problemas visuales durante el primer renderizado.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento referenciado.
    */

    const elementRef = useRef(null);
    const scaleValueRef = useRef(null); 
    const map = useMap();
    const [scaleLabel, setScaleLabel] = useState('');
    const [scaleWidth, setScaleWidth] = useState(50); 
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel', 'click']);

    /*******************************************************************************************************************************************************/

    /** Funcion calculateScale: Sirve para obtener la escala del mapa, es decir, calcula cuanta distancia en el mundo real representa un pequeño pedazo del 
     *  mapa, como si se lo estuviera midiendo con una regla en la pantalla.
     * 1. Definimos un ancho en pixeles (100 píxeles) que se usara para medir la distancia en el mapa en la pantalla.
     *    - maxWidth: constante que representa el ancho en pixeles, del la linea o barra de escala que va a aparecer en el mapa, y que se va a usar para 
     *      calcular la distancia en la escala.
     * 2. Calculamos dos puntos en el mapa, uno en el borde izquierdo y otro 100 pixeles a la derecha: 
     *    - centreLatLng: Obtenemos el tamaño vertical (altura) del contenedor del mapa y lo dividimos entre 2 para 
     *      obtener el punto medio en el eje y del mapa. Se define un punto en la coordenada (0, y) donde "y" es el 
     *      centro vertical del mapa y 0 es el borde izquierdo del mapa en pixeles. La funcion "containerPointToLatLng()" 
     *      convierte ese punto de coordenadas en pixeles en una posición geografica (latitud y longitud), para asi 
     *      obtener la coordenada en el mapa que corresponde al borde izquierdo, en el centro vertical del mapa. El 
     *      resultado es un objeto LatLng que representa dicha posicion geografica. Entonces, obtenemos el centro del 
     *      borde izquierdo del mapa.
     *    - rightLatLng: Para esta constante se realiza un calculo similar al anterior, pero en lugar de usar 0 en el 
     *      eje "x" (el borde izquierdo), se utiliza "maxWidth" (100 pixeles a la derecha). El objetivo es obtener la 
     *      posición geográfica que esta a 100 pixeles hacia la derecha del borde izquierdo, en la misma posición vertical 
     *      (y) en el centro del mapa. Entonces, del centro del borde izquierdo del mapa, nos movemos 100 pixeles a la 
     *      derecha pero seguimos en el centro vertical del mapa.
     * 4. Calculamos la distancia entre los dos puntos anteriores para que podamos determinar cuantos metros o kilometros mide esa parte del mapa.
     *    - metres: Mediante "distanceTo()" calculamos la distancia entre las dos coordenadas geográficas, en este caso 
     *      entre "centreLatLng" y "rightLatLng", en metros. Luego, mediante "_getRoundNum()" redondeamos la distancia 
     *      calculada a un valor "limpio" y legible (por ejemplo, 100 en lugar de 96,5), utilizando una logica especifica 
     *      para obtener numeros redondeados en función de la magnitud de la distancia. El resultado final es la distancia 
     *      en metros entre el borde izquierdo y el punto 100 pixeles a la derecha.
     * 5. En funcion del resultado tenemos las siguientes condiciones:
     *    - Si la distancia es menor a 1000 metros, se muestra el valor en metros, por ejemplo, "500 m".
     *    - Si la distancia es mayor o igual a 1000 metros, se convierte la distancia a kilometros dividiendo a la misma por 1000.
     *    Por otro lado, si el resultado es un numero entero (por ejemplo, 2 km), se muestra sin decimales. Pero si el resultado no es un numero entero (por 
     *    ejemplo, 1.75 km), se muestra con dos decimales usando.
     * 6. Finalmente se actualiza el estado "scaleLabel" con el valor calculado.
    */ 

    const calculateScale = () => {
        const maxWidth = 100; 
        const centreLatLng = map.containerPointToLatLng([0, map.getSize().y / 2]);
        const rightLatLng = map.containerPointToLatLng([maxWidth, map.getSize().y / 2]);

        const metres = L.control.scale()._getRoundNum(centreLatLng.distanceTo(rightLatLng));
        let label;
        if (metres < 1000) {
            label = `${metres} m`;
        } else {
            const kilometres = metres / 1000;
            label = Number.isInteger(kilometres) ? `${kilometres} km` : `${kilometres.toFixed(2)} km`;
        }

        setScaleLabel(label);
    };

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para observar los cambios en el tamaño del texto que representa la escala del mapa, y para ajustar dinámicamente 
     * el ancho del contenedor de dicha escala. Este se ejecutará cuando el valor de "scaleLabel" cambie, ya que se especifica como una dependencia.
     * 1. Se crea una nueva instancia de "ResizeObserver", una API del navegador que permite observar cambios en el tamaño de un elemento. En este caso, el 
     *    "ResizeObserver" se utiliza para observar cambios en el ancho del texto que muestra la escala. Luego, hacemos la siguiente verificacion:
     *    - Dado "scaleValueRef", el estado definido previamente para referenciar al elemento que contiene el texto de la escala (es decir, el "span" con el 
     *      valor de la escala), si este mismo existe, se accede a su ancho actual con "offsetWidth". Este ancho representa el espacio que ocupa el texto de 
     *      la escala en pixeles. Luego, se llama a "setScaleWidth" para ajustar el ancho del contenedor de la escala, añadiendo un total de 50 píxeles (25px 
     *      de padding a cada lado) al valor medido de calculado anteriormente.
     * 2. Luego, verificamos nuevamente si el elemento al que se refiere "scaleValueRef" existe, y si es asi, se le pasa al observer para que observe los 
     *    cambios en su tamaño. El metodo "observe" de "ResizeObserver" inicia la observacion de este elemento, de modo que cualquier cambio en su ancho, al 
     *    cambiar el texto, desencadenara el codigo dentro del "ResizeObserver" que se explico previamente.
     * 3. El "return" es la "función de limpieza" que se ejecuta cuando el "useEffect" se desmonta (es decir, cuando el componente se desmonta o se actualiza 
     *    "scaleLabel"). Mediante "unobserve" nos aseguramos de que se dejem de observar cambios en el tamaño del elemento cuando ya no es necesario. 
     * 4. Este "useEffect" depende de "scaleLabel", lo que significa que se ejecutará cada vez que el valor de "scaleLabel" cambie, o cada vez que el texto 
     *    de la escala (por ejemplo, "100 m" o "1 km") cambie, y se ejecutara nuevamente para ajustar el ancho del contenedor.
    */

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (scaleValueRef.current) {
                const valueWidth = scaleValueRef.current.offsetWidth;
                setScaleWidth(valueWidth + 50);
            }
        });

        if (scaleValueRef.current) {
            observer.observe(scaleValueRef.current);
        }

        return () => {
            if (scaleValueRef.current) {
                observer.unobserve(scaleValueRef.current);
            }
        };
    }, [scaleLabel]); 

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para asegura que la escala del mapa esté siempre actualizada y evita problemas cuando el componente deja de estar 
     * activo.
     * 1. Como primera medida, escuchamos dos eventos en el mapa:
     *    - zoomend: Este evento se dispara cuando se cambia el nivel de zoom del mapa, y el zoom ha finalizado.
     *    - resize: Este evento ocurre cuando el tamaño del mapa cambia (por ejemplo, si la ventana del navegador cambia de tamaño).
     *    Luego, llamamos calculateScale() que es la función que se ejecutará cuando ocurra cualquiera de estos dos eventos. 
     * 2. Se llama inmediatamente a la funcion "calculateScale()"" cuando el componente se monta, asegurando que la escala se calcule al menos una vez desde 
     *    el principio. Esto es importante ya que podriamos estar viendo el mapa por primera vez, y la escala necesita estar de forma correcta desde el 
     *    inicio, antes de que ocurran otros eventos como el zoom o el cambio de tamaño.
     * 3. Por ultimo, el "return" es "función de limpieza" que se ejecuta cuando el componente se desmonta (es decir, cuando deja de estar visible en la 
     *    pantalla) o cuando se vuelve a ejecutar el "useEffect" debido a cambios en sus dependencias. Con "off()" se eliminan los eventos "zoomend" y 
     *    "resize" del mapa para que no se sigan ejecutando una vez que el componente ya no este en uso.
     * 4. Este "useEffect" depende de "map", lo que significa que se ejecutará cada vez que el estado del mismo cambie al cambiar el zoom,
    */

    useEffect(() => {
        map.on('zoomend resize', calculateScale);
        calculateScale();
        return () => {
            map.off('zoomend resize', calculateScale);
        };
    }, [map]);

    /*******************************************************************************************************************************************************/

    return (
        <div className="scaleControllerMap"
            ref={elementRef}
            onMouseEnter={() => setIsMouseOverComponent(true)} 
            onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="scaleControllerItem" style={{ width: `${scaleWidth}px` }}>
                <span className="scaleValue" ref={scaleValueRef}>{scaleLabel}</span>
            </div>
        </div>
    );
};



export default MapScaleControl;
