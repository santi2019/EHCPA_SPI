import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';
import useRippleEffect from '../../../hooks/useRippleEffect';
import ModalSolidLayers from './modalReferenceLayers/ModalReferenceLayers';
import "./mapreferencelayers.css";


/**
 * Componente MapSolidLayers: Menu que permite el control de la visualizacion en el mapa de las capas
 * de las provincias de Argentina, y las cuencas de Salsipuedes, San Antonio, Cosquin, San Roque, Los 
 * Molinos y Embalse, que fueron cargados como archivos shape en GeoServer.
 * Su estructura es la siguiente:
 * - buttonSolidLayersContainer: Contenedor que se utiliza para estructurar el contenido del boton.
 * - buttonSolidLayers: boton que permite la visualizacion del modal "ModalSolidLayers" para ver el 
 *   menu de capas solidas.
 * - Por ultimo, se exporta "MapSolidLayers" como componente.
*/
const MapReferenceLayers = ({setIsMouseOverComponent}) => {

    /** Estados y variables:
     * - isVisible: variable para controlar la visibilidad del modal de capas solidas.
     * - isNavbarSwitchChecked: variable booleana que determina si el switch del navbar del modal 
     *   esta activado.
     * - layersSwitches: Arreglo que gestiona el estado activado/desactivado de las capas, en donde 
     *   cada una tiene un valor booleano asociado, que por defecto es true, indicando que estan 
     *   siempre activadas al comienzo.
     * - layerOpacity: Arreglo que gestiona el nivel de opacidad de las capas, en donde por defecto
     *   poseen el maximo valor de opacidad que es 1.
     * - layers: Se utiliza para almacenar las referencias a las capas de GeoServer, permitiendo su 
     *   manipularlas sin necesidad de recrearlas.
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento
     *   referenciado.
     * - createRipple: Llamada al hook useRippleEffect para generar un efectp ripple.
     */
    const [isVisible, setIsVisible] = useState(false);
    const [isNavbarSwitchChecked, setIsNavbarSwitchChecked] = useState(true);
    const [layersSwitches, setLayersSwitches] = useState({
        salsipuedes: true,
        sanAntonio: true,
        cosquin: true,
        sanRoque: true,
        losMolinos: true,
        embalse: true,
        provincias: true
    });
    const [layerOpacity, setLayerOpacity] = useState({
        salsipuedes: 1,
        sanAntonio: 1,
        cosquin: 1,
        sanRoque: 1,
        losMolinos: 1,
        embalse: 1,
        provincias: 1
    });
    const layers = useRef({});
    const elementRef = useRef(null);
    const map = useMap();
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel']);
    const createRipple = useRippleEffect();


    /**
     * Funcion handleCuencasLayers: Sirve para gestionar las capas de las cuencas de GeoServer.
     * 1. La funcion recibe como parametros el nombre de la capa que se va a gestionar localmente
     *    y el correspondiente nombre de la capa en el servidor GeoServer.
     * 2. El primer "useEffect" sirve para manejar la logica de creacion de la capa, y la adicion
     *    o eliminacion de esta del mapa en función del nivel de zoom y del estado del switch asociado 
     *    a dicha capa.
     *    - Verificamos si la capa ya existe en el objeto "layers" de referencias. En caso de que no
     *      se crea una nueva instancia de la capa, y para esto, nos conectamos con el servidor GeoServer
     *      y se carga la capa que se pasa por parametro en la funcion. A dicha capa se le carga su
     *      correspondiente opacidad, y se especifica el z-index y el formato de imagen.
     *    - La capa añadida se almacena en en el objeto "layers" de referencias para evitar recrearla.
     *    - A traves de la funcion handleZoom(), comprobamos el nivel de zoom actual del mapa. Y de 
     *      acuerdo a esto, si el zoom es mayor o igual a 6 y el switch correspondiente a la capa, esta 
     *      activado, entonces la capa se añade al mapa si no esta presente. Si el zoom es menor a 6 o 
     *      el switch esta desactivado, la capa se elimina del mapa si estaba visible.
     *    - Se añade un listener que detecta el evento zoomend, es decir, cada vez que dejamos de hacer 
     *      zoom en el mapa. Al final de cada accion de zoom, se ejecuta inmediatamente "handleZoom()" 
     *      para verificar si la capa debe añadirse o quitarse.
     *    - El return aplica la funcion de limpieza para asegurarnos de que cuando el componente o efecto 
     *      se desmonte, se elimine el listener del evento "zoomend".
     * 3. El segundo "useEffect" se encarga de actualizar la opacidad de la capa cuando cambia el estado
     *    "layerOpacity".
     *    - Si la capa esta actualmente visible en el mapa, se actualiza la opacidad de la misma cada vez 
     *      que cambia el estado de "layerOpacity" que le corresponde.
    */
    const handleCuencasLayers = (layerName, geoserverLayer) => {
        useEffect(() => {
            if (!layers.current[layerName]) {
                const layer = L.Geoserver.wms('http://localhost:8080/geoserver/EHCPA/wms', {
                    layers: geoserverLayer,
                    opacity: layerOpacity[layerName], 
                    zIndex: 2000,
                    format: 'image/png',
                });
                layers.current[layerName] = layer;
            }

            const layer = layers.current[layerName];

            const handleZoom = () => {
                const currentZoom = map.getZoom();
                if (currentZoom >= 6 && layersSwitches[layerName]) {
                    if (!map.hasLayer(layer)) {
                        map.addLayer(layer);
                    }
                } else {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            };

            map.on('zoomend', handleZoom);
            handleZoom();

            return () => {
                map.off('zoomend', handleZoom);
            };
        }, [map, layersSwitches[layerName]]);

        useEffect(() => {
            const layer = layers.current[layerName];
            if (map.hasLayer(layer)) {
                layer.setOpacity(layerOpacity[layerName]);
            }
        }, [layerOpacity[layerName]]);
    };

    handleCuencasLayers('salsipuedes', 'EHCPA:Cca_Salsipuedes');
    handleCuencasLayers('sanAntonio', 'EHCPA:Cca_San_Antonio');
    handleCuencasLayers('cosquin', 'EHCPA:Cca_Cosquin');
    handleCuencasLayers('sanRoque', 'EHCPA:Cca_San_Roque');
    handleCuencasLayers('losMolinos', 'EHCPA:Cca_Los_Molinos');
    handleCuencasLayers('embalse', 'EHCPA:Cca_Embalse');


    /**
     * Funcion handleProvinciasLayer: Sirve para gestionar la capa de las Provincias de Argentina 
     * de GeoServer.
     * 1. La funcion recibe como parametros el nombre de la capa que se va a gestionar localmente
     *    y el correspondiente nombre de la capa en el servidor GeoServer.
     * 2. El primer "useEffect" sirve para manejar la logica de creacion de la capa, y la adicion
     *    o eliminacion de esta del mapa en función del estado del switch asociado a dicha capa.
     *    - Verificamos si la capa ya existe en el objeto "layers" de referencias. En caso de que no
     *      se crea una nueva instancia de la capa, y para esto, nos conectamos con el servidor GeoServer
     *      y se carga la capa que se pasa por parametro en la funcion. A dicha capa se le carga su
     *      correspondiente opacidad, y se especifica el z-index y el formato de imagen.
     *    - La capa añadida se almacena en en el objeto "layers" de referencias para evitar recrearla.
     *    - A traves de la funcion updateLayer(), determinamos si la capa debe añadirse o eliminarse 
     *      del mapa. Si el switch asociado a la capa esta activado, y la capa no esta en el mapa, 
     *      se añade al mapa. Si el switch esta desactivado y la capa esta en el mapa, se elimina.
     *      Se llama a "updateLayer()" inmediatamente después de ser definida para actualizar el estado 
     *      de la capa de acuerdo con el estado actual del switch de dicha capa.
     *    - El return aplica la funcion de limpieza para asegurarnos de que la capa se elimine del mapa 
     *      si está presente.
     * 3. El segundo "useEffect" se encarga de actualizar la opacidad de la capa cuando cambia el estado
     *    "layerOpacity".
     *    - Si la capa esta actualmente visible en el mapa, se actualiza la opacidad de la misma cada vez 
     *      que cambia el estado de "layerOpacity" que le corresponde.
    */
    const handleProvinciasLayer = (layerName, geoserverLayer) => {
        useEffect(() => {
            if (!layers.current[layerName]) {
                const layer = L.Geoserver.wms('http://localhost:8080/geoserver/EHCPA/wms', {
                    layers: geoserverLayer,
                    opacity: layerOpacity[layerName], 
                    format: 'image/png',
                    zIndex: 2000,
                });
                layers.current[layerName] = layer;
            }
    
            const layer = layers.current[layerName];
    
            const updateLayer = () => {
                if (layersSwitches[layerName]) {
                    if (!map.hasLayer(layer)) {
                        map.addLayer(layer);
                    }
                } else {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            };
    
            updateLayer();
    
            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            };
        }, [map, layersSwitches[layerName]]);
    
        useEffect(() => {
            const layer = layers.current[layerName];
            if (map.hasLayer(layer)) {
                layer.setOpacity(layerOpacity[layerName]);
            }
        }, [layerOpacity[layerName]]);
    };
    
    handleProvinciasLayer('provincias', 'EHCPA:Provincias');


    /**
     * Funcion handleOpacityChange: Sirve para actualizar el estado de opacidad de una capa en 
     * particular en el mapa.
     * 1. La funcion recibe como parametros el nombre de la capa que se va a gestionar localmente
     *    y el nuevo valor de opacidad para la capa especificada, que puede ser un numero decimal
     *    entre 0 y 1, donde 0 es completamente transparente y 1 completamente opaco.
     * 2. La funcion "setLayerOpacity()" actualiza el estado de "layerOpacity" que previamente 
     *    definimos. Obtenemos el estado actual de "layerOpacity" antes de la actualizacion. Con
     *    (...) copiamos todos los valores actuales de prevState a un nuevo objeto para asegura 
     *    que las opacidades de las demas capas no se sobrescriban, manteniéndose iguales. Por 
     *    ultimo se actualiza solo la capa específica (layer) que se esta modificando. El nuevo 
     *    valor de opacidad se establece para esa capa con "value".
    */
    const handleOpacityChange = (layer, value) => {
        setLayerOpacity((prevState) => ({
            ...prevState,
            [layer]: value
        }));
    };


    /**
     * Funcion handleNavbarSwitchChange: Sirve para gestionar el switch del navbar del modal de 
     * capas solidas. Esta funcion permite habilitar o deshabilitar la visualizacion de todas las
     * capas mediante un unico switch, que es el del navbar del modal.
     * 1. La funcion recibe como parametro "checked", en donde este valor representa el estado 
     *    del switch del navbar, el cual es un booleano. Si es true, el switch esta activado, si
     *    es false, esta desactivado. Este parametro se pasa cuando se interactua con dicho switch.
     * 2. Mediante "setIsNavbarSwitchChecked()" actualizamos el estado "isNavbarSwitchChecked". Si 
     *    el switch global esta activado (es decir, checked = true), el estado "isNavbarSwitchChecked"
     *    se actualizara a true, y si esta desactivado (checked = false), se actualizara a false.
     * 3. Mediante "setLayersSwitches()" se actualiza el estado "layersSwitches", que definimos 
     *    previamente y que contiene los estados individuales de visibilidad de cada capa del mapa. 
     *    El nuevo objeto que se pasa a "setLayersSwitches" establece el valor de cada capa al valor 
     *    de checked, es decir, si checked es true, todas las capas se activarán y seran visibles, pero
     *    si checked es false, todas las capas se desactivaran y se ocultaran.
    */
    const handleNavbarSwitchChange = (checked) => {
        setIsNavbarSwitchChecked(checked);
        setLayersSwitches({
            salsipuedes: checked,
            sanAntonio: checked,
            cosquin: checked,
            sanRoque: checked,
            losMolinos: checked,
            embalse: checked,
            provincias: checked
        });
    };


    /**
     * Funcion handleLayerSwitchChange: Sirve para gestionar el switch de cada una de las capas. Esta
     * funcion permite habilitar o deshabilitar la visualizacion de las capas de forma individual.
     * 1. La funcion recibe como parametro el nombre de la capa cuyo estado de visibilidad se quiere 
     *    cambiar, y "checked", en donde este valor representa el estado del switch asociado a dicha 
     *    capa, en donde al ser un valor booleano, si es true, el switch esta activado y la capa de 
     *    muestra en el mapa, y si es false, esta desactivado y la capa se oculta, y el valor de este 
     *    parametro se pasa cuando se interactua con dicho switch.
     * 2. La funcion "setLayersSwitches()" actualiza el estado de "layersSwitches" que previamente 
     *    definimos. Obtenemos el estado actual de "layersSwitches" antes de la actualizacion. Con
     *    (...) copiamos todos los valores actuales de prevState a un nuevo objeto para asegura 
     *    que el valor de los switch de las demas capas no se modifiquen, manteniéndose iguales. Por 
     *    ultimo se actualiza solo la capa específica (layer) que se esta modificando. El nuevo 
     *    valor del switch se establece para esa capa con "checked".
    */
    const handleLayerSwitchChange = (layer, checked) => {
        setLayersSwitches((prevState) => ({
            ...prevState,
            [layer]: checked
        }));
    };


    /**
     * Funcion handleVisibility: Sirve para gestionar la visualizacion del modal de capas solidas
     * y por otro lado crear el efecto visual ripple sobre el boton al interactuar sobre el mismo.
     * 1. La funcion recibe como parametro "e" que representa el evento de "onClick" que ocurre 
     *    cuando se hace click en el boton, y es pasado como parametro a createRipple() para 
     *    ejecutar el efecto sobre dicho elemento.
     * 2. Luego tenemos setIsVisible() que basicamente actualiza el estado "isVisible", que previamente
     *    definimos como "false". Entonces al negar su valor, cada vez que se ejecuta la funcion
     *    "handleVisibility", el valor de "isVisible" cambia a su opuesto de ese momento. Entonces,
     *    si "isVisible" actualmente es true (el modal esta visible), se convierte en false (el modal se 
     *    oculta). Si "isVisible" actualmente es false (el modal esta oculto), se convierte en true (el 
     *    modal se muestra).
    */
    const handleVisibility = (e) => {
        setIsVisible(!isVisible);
        createRipple(e)
    };


    /**
     * Funcion closeLayersContainer: Sirve para cerrar el modal de capas solidas. Esta misma se implementa
     * en el icono "x" del navbar del modal de capas solidas.
     * 1. Directamente actualizamos el valor de "isVisible" a "false" para ocultar el modal.
     * 2. Al setear "false" en setIsMouseOverComponent() indicamos que el mouse ya no está sobre ese
     *    componente, en este caso el modal.
    */
    const closeLayersContainer = () => {
        setIsMouseOverComponent(false);
        setIsVisible(false);
        document.body.style.cursor = 'default';

    };



    return(
        <div ref={elementRef}  onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="buttonSolidLayersContainer">
                <button className='buttonSolidLayers' onClick={handleVisibility}>
                    <FontAwesomeIcon className="layersIcon" icon={faLayerGroup} />
                </button>  
            </div>
            <ModalSolidLayers  
                isVisible={isVisible}
                closeLayersContainer={closeLayersContainer}
                isNavbarSwitchChecked={isNavbarSwitchChecked}
                handleNavbarSwitchChange={handleNavbarSwitchChange}
                layersSwitches={layersSwitches}
                handleLayerSwitchChange={handleLayerSwitchChange}
                layerOpacity={layerOpacity}
                handleOpacityChange={handleOpacityChange}
            />
        </div>
    );
};


export default MapReferenceLayers;
