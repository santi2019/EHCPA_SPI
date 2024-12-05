import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark} from "@fortawesome/free-solid-svg-icons";
import "./mapmenu.css";
import 'leaflet-geoserver-request';
import axios from 'axios';
import FileDownload from "js-file-download"
import Swal from 'sweetalert2' 
import {useDrag} from 'react-use-gesture';
import MenuContent from './menuContent/MenuContent';
import DraggableModal from './draggableModal/DraggableModal';
import useRippleEffect from '../../../hooks/useRippleEffect';
import useMapEventHandlers from '../../../hooks/useMapEventHandlers';
import InfoMap from '../mapMenu/menuContent/infoMap/InfoMap';

/*******************************************************************************************************************************************************/

/**
 * Componente MapMenu: Boton que permite desplegar el menu con las opciones de visualizar las capas de PTM, SPI, visualizar el modal informativo del mapa, 
 * y la descarga de los archivos. 
 * Su estructura es la siguiente: 
 * - menuContainer: Contenedor que se utiliza para estructurar el contenido del boton.
 * - menuButton: Boton que permite la apertura y cierre del menu de opciones.
 * - MenuContent: Componente que renderiza todos los botones para la visualziacion de PTM, SPI, el modal informativo y la descarga de archivos.
 * - InfoMap: Componenete que renderiza el modal informativo del mapa.
 * - DraggableModal: Componente que renderiza el dragg modal que indica los valores de las coordenadas, PTM y SPI de un punto en el mapa.
 * - Por ultimo, se exporta "MapMenu" como componente.
*/

const MapMenu = ({setIsMouseOverComponent, isMouseOverComponent}) => {

     /** Estados y variables:
     * - elementRef: Se utiliza para crear una referencia a un elemento.
     * - map: Obtenemos la instancia del mapa para poder acceder a sus propiedades.
     * - PTMResult: Estado para almacenar el valor específico de PTM obtenido del servidor GeoServer cuando se selecciona un punto en el mapa. Cuando 
     *   se hace click en otro punto del mapa, a traves de "setPTMResult" se actualiza el contenido del estado.
     * - notFoundPTMResults: Estado que almacena un mensaje de "S/D" (Sin Datos), para los casos donde no se encuentran datos de PTM. TA traves de 
     *   "setNotFoundPTMResults" se setea el contenido del mensaje.
     * - SPIResults: Arreglo para almacenar el valor específico de cada uno de los SPI obtenidos del servidor GeoServer cuando se selecciona un punto 
     *   en el mapa. Cuando se hace click en otro punto del mapa, a traves de "setSPIResults" se actualiza el contenido del arreglo.
     * - notFoundSPIResults: Arrglo que almacena un mensaje de "S/D" (Sin Datos), para los casos donde no se encuentran datos de SPI para todas las 
     *   escalas. A traves de "setNotFoundSPIResults" se setea el contenido del mensaje.
     * - coordinatesResult: Estado que almacena las coordenadas (latitud y longitud) del punto seleccionado en el mapa. Mediante "setCoordinatesResult" 
     *   se actualiza el valor del estado. 
     * - isMouseOverRef: Estado que mediante "useRef" mantiene el valor de isMouseOverComponent, evitando que se reinicie en cada renderizado. Esto 
     *   permite saber si el mouse está sobre el componente y manejar comportamientos de interacción.
     * - isDraggModalVisible: Estado para controlar la visibilidad del componente "draggableModal" (modal que muestra las coordenadas del punto 
     *   seleccionado en el mapa junto con los valores de las capas activadas). Mediante "setIsDraggModalVisible" se establece si es visible o no.
     * - isMenuOpen: Estado que controla la visualizacion del componente "menuContent" (que contiene las opciones de visualización de capas, opciones 
     *   de descarga, etc.). Mediante "setIsMenuOpen" se establece si es visible o no.
     * - isPrecipitationOpen: Estado para controlar la visibilidad del modal de precipitación dentro del componente "menuContent". Mediante 
     *   "setIsPrecipitationOpen" se establece si es visible o no.
     * - isPrecipitationNavbarSwitchChecked: Estado para controlar si el switch del navbar del modal de precipitación dentro del componente "menuContent"
     *   está activado o no. Mediante "setIsPrecipitationNavbarSwitchChecked" se establece si es checked o no.
     * - PTMlayerSwitch: Estado que controla el switch de la capa de PTM, para determinar si esta activada o no. Mediante "setPTMLayerSwitch" se establece 
     *   si es checked o no.
     * - isSPINavbarSwitchChecked: Estado para controlar si el switch del navbar del modal de SPI dentro del componente "menuContent" está activado o no. 
     *   Mediante "setIsSPINavbarSwitchChecked" se establece si es checked o no.
     * - SPIlayersSwitches: Arreglo que controla el switch de cada una de las capas de SPI, para determinar si estan activadas o no. Mediante "setSPILayersSwitches" 
     *   se establece si estan checked o no.
     * - isSPIOpen: Estado para controlar la visibilidad del modal de SPI dentro del componente "menuContent". Mediante "setIsSPIOpen" se establece si es 
     *   visible o no.
     * - layerOpacity: Arreglo que establece el nivel de opacidad de cada una de las capas, tanto de PTM como de SPI, permitiendo ajustar la transparencia 
     *   de cada capa de forma independiente. Mediante "setLayerOpacity" se actualiza el valor de la opacidad.
     * - layers: Estado que mediante "useRef" actúa como contenedor para las capas en el mapa, permitiendo agregar o quitar capas sin afectar el estado.
     * - modalInitialPosition: Constante que define las coordenadas de la posición inicial del componente draggableModal en el mapa.
     * - modalPositionRef: Estado que mediante "useRef" se referencia al componente draggableModal en el DOM, permitiendo acceder a sus dimensiones y 
     *   ajustarlas durante el dragg (arrastre).
     * - downloadProgress: Estado para almacenar el porcentaje de progreso de descarga de los archivos. Mediante "setDownloadProgress" se actualiza el 
     *   valor.
     * - isDownloading: Estado para controlar si una descarga está en progreso, mediante "true", o no mediante "false", permitiendo de esta manera mostrar 
     *   un indicador visual de descarga activa. Mediante "setIsDownloading" se establece el valor de dicha flag. 
     * - isInfoMapOpen: Estado para controlar la visibilidad del modal informativo del mapa dentro del componente "menuContent". Mediante "setIsInfoMapOpen"
     *   se establece si es visible o no.
     * - dates: Estado que almacena las fechas relevantes para el modal informativo del mapa dentro del componente "menuContent", obtenidas del backend, 
     *   las cuales son la fecha actual, la fecha de la última banda y la fecha de fin de calibración. Mediante "setDates" actualizamos sus valores.
     * - isCopied: Estado que controla si los valores del componente draggableModal han sido copiados al portapapeles, mostrando un indicador visual de 
     *   confirmación tras copiar los datos. Mediante "setIsCopied" indicamos si se efectuo la copia o no.
     * - useMapEventHandlers: Llamada al hook para escuchar los eventos definidos, sobre el elemento referenciado.
     * - createRipple: Llamada al hook useRippleEffect para generar un efectp ripple.
    */

    const elementRef = useRef(null);
    const map = useMap();
    const [PTMResult, setPTMResult] = useState(null);
    const [notFoundPTMResults, setNotFoundPTMResults] = useState("");
    const [SPIResults, setSPIResults] = useState({
        SPI_1: null,
        SPI_2: null,
        SPI_3: null,
        SPI_6: null,
        SPI_9: null,
        SPI_12: null,
        SPI_24: null,
        SPI_36: null,
        SPI_48: null,
        SPI_60: null,
        SPI_72: null,
    });
    const [notFoundSPIResults, setNotFoundSPIResults] = useState({
        SPI_1: "",
        SPI_2: "",
        SPI_3: "",
        SPI_6: "",
        SPI_9: "",
        SPI_12: "",
        SPI_24: "",
        SPI_36: "",
        SPI_48: "",
        SPI_60: "",
        SPI_72: "",
    });
    const [coordinatesResult, setCoordinatesResult] = useState([]);
    const isMouseOverRef = useRef(isMouseOverComponent);
    const [isDraggModalVisible, setIsDraggModalVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPrecipitationOpen, setIsPrecipitationOpen] = useState(false);
    const [isPrecipitationNavbarSwitchChecked, setIsPrecipitationNavbarSwitchChecked] = useState(true);
    const [PTMlayerSwitch, setPTMLayerSwitch] = useState({
        PTM: true
    });
    const [isSPINavbarSwitchChecked, setIsSPINavbarSwitchChecked] = useState(false);
    const [SPIlayersSwitches, setSPILayersSwitches] = useState({
        SPI_1: false,
        SPI_2: false,
        SPI_3: false,
        SPI_6: false,
        SPI_9: false,
        SPI_12: false,
        SPI_24: false,
        SPI_36: false,
        SPI_48: false,
        SPI_60: false,
        SPI_72: false,
    });
    const [isSPIOpen, setIsSPIOpen] = useState(false);
    const [layerOpacity, setLayerOpacity] = useState({
        PTM: 1,
        SPI_1: 1,
        SPI_2: 1,
        SPI_3: 1,
        SPI_6: 1,
        SPI_9: 1,
        SPI_12: 1,
        SPI_24: 1,
        SPI_36: 1,
        SPI_48: 1,
        SPI_60: 1,
        SPI_72: 1,
    });
    const layers = useRef({});
    const modalInitialPosition = { x: 58, y: 104 };
    const modalPositionRef = useRef(modalInitialPosition);
    const [modalPosition, setModalPosition] = useState(modalPositionRef.current);
    const modalRef = useRef(null); 
    const [downloadProgress, setDownloadProgress] = useState(null); 
    const [isDownloading, setIsDownloading] = useState(false);
    const [isInfoMapOpen, setIsInfoMapOpen] = useState(false);
    const [dates, setDates] = useState({
        today_day: "",
        today_month: "",
        today_year: "",
        last_band_day: "",
        last_band_month: "",
        last_band_year: "",
        calibration_date: ""
    });
    const [isCopied, setIsCopied] = useState(false);
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel']);
    const createRipple = useRippleEffect();

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleDownloadClick: Sirve para gestionar la descarga de los archivos de PTM y SPI, desde el servidor backend. La descarga se efectua en base
     * a las capas activadas.
     * 1. La funcion recibe como parametro el evento "e", que representa el evento "onClick" cuando se hace click en el boton de descarga. 
     * 2. Se ejecuta "preventDefault" para evitar el comportamiento por defecto del evento.
     * 3. A traves de "createRipple" se ejecuta el efecto visual ripple sobre el boton en el que se hizo click.
     * 4. "setIsMouseOverComponent" se establece en "true" para indicar que el mouse está sobre el componente durante la descarga.
     * 5. Inicializamos un arreglo "selectedLayers" vacio que almacena las capas seleccionadas para la descarga. Verificamos si la capa de PTM está activada
     *    mediante "PTMlayerSwitch.PTM", y si lo está, se agrega "PTM" al arreglo "selectedLayers". Luego recorremos cada capa de SPI dentro de "SPIlayersSwitches", 
     *    en donde si una capa está activada, se agrega al arreglo "selectedLayers".
     * 6. Si el arreglo "selectedLayers" está vacio, se muestra un mensaje de alerta utilizando "Swal.fire" indicando que es necesario seleccionar al menos 
     *    una capa para proceder con la descarga. Se retorna de la funcion para evitar la descarga sin capas seleccionadas.
     * 7. En el bloque "try", se inicia el proceso de descarga estableciendo "setIsDownloading" en true, indicando que la descarga está en progreso. 
     *    A continuacion, "setDownloadProgress" se inicializa en 0 para empezar a mostrar el progreso de la descarga.
     * 8. Generamos la URL dinamica de descarga concatenando la URL del backend con las capas seleccionadas, separadas por comas.
     * 9. Realizamos la solicitud de tipo get al backend con "axios" usando la URL generada. Especificamos "responseType" como "blob" para recibir archivos 
     *    binarios. Adicionalmente, en "onDownloadProgress" calculamos el porcentaje de progreso de la descarga y actualizamos "setDownloadProgress" cada vez 
     *    que cambia.
     * 10. Una vez completada la descarga, se guarda el archivo descargado con el nombre "EHCPA_Data.zip" utilizando la libreria "FileDownload". Y se espera 
     *     1200 ms para asegurar que el proceso de descarga finalice, y luego se actualizan los estados "setIsDownloading" a "false" para indicar que termino 
     *     la descarga y "setDownloadProgress" a "null" para resetear el progreso.
     * 11. En el bloque "catch", se maneja el error en caso de que ocurra alguna excepcion durante la descarga, ya que es un archivo binario (blob). Se setea
     *     a "setIsDownloading" en "false" y "setDownloadProgress" en "null" para finalizar la descarga en caso de error.
     *     - Si el error contiene una respuesta del servidor, se convierte el blob en texto y se parsea para mostrar el mensaje de error utilizando "Swal.fire". 
     *       Este caso ocurre cuando se intenta descargar un archivo que no existe o no esta disponible.
     *     - Si el error es del tipo "Network Error", se muestra una alerta de error especifica indicando un problema de conexion con el servidor.
     *     - Para otros errores desconocidos, se muestra una alerta general informando que ocurrió un error inesperado.
    */

    const handleDownloadClick = async (e) => {
        e.preventDefault();
        createRipple(e);
        setIsMouseOverComponent(true);

        const selectedLayers = [];
        
        if (PTMlayerSwitch.PTM) {
            selectedLayers.push('PTM');
        }
        
        Object.keys(SPIlayersSwitches).forEach((key) => {
            if (SPIlayersSwitches[key]) {
                selectedLayers.push(key);  
            }
        });
    
        if (selectedLayers.length === 0) {
            Swal.fire({
                title: 'Atención',
                text: 'Debe seleccionar al menos una capa para descargar.',
                icon: 'warning',
                confirmButtonText: 'Continuar',
                allowOutsideClick: false,   
                allowEscapeKey: false,
                willOpen: () => setIsMouseOverComponent(true), 
                willClose: () => setIsMouseOverComponent(false)       
            });
            return;
        }
    
        try {
            setIsDownloading(true); 
            setDownloadProgress(0);

            const url = `${import.meta.env.VITE_BACKEND_DOWNLOAD_URL}/${selectedLayers.join(',')}`;
    
            const res = await axios.get(url, {
                responseType: 'blob', 
                onDownloadProgress: function (progressEvent) {
                    if (progressEvent.lengthComputable) {
                        const percentComplete = ((progressEvent.loaded / progressEvent.total) * 100).toFixed();
                        setDownloadProgress(percentComplete);
                    } else {
                        console.log("Descarga en proceso, por favor espere...");
                    }
                }
            });
    
            FileDownload(res.data, 'EHCPA_Data.zip');
            setTimeout(() => {
                setIsDownloading(false); 
                setDownloadProgress(null); 
            }, 1200);

        } catch (error) { 

            setIsDownloading(false); 
            setDownloadProgress(null);

            if (error.response && error.response.data) {
                const errorBlobText = await error.response.data.text();
                const errorMessage = JSON.parse(errorBlobText);
                
                Swal.fire({
                    title: 'Oops!',
                    text: errorMessage.message,
                    icon: 'error',
                    confirmButtonText: 'Continuar',
                    allowOutsideClick: false,   
                    allowEscapeKey: false,
                    willOpen: () => setIsMouseOverComponent(true), 
                    willClose: () => setIsMouseOverComponent(false)        
                });
            } else {
                const otherError = error.message;
                if(otherError == "Network Error"){
                    Swal.fire({
                        title: otherError,
                        text: 'Error de conexión con el servidor, por lo que no es posible realizar la descarga en este momento. Intente nuevamente más tarde.',
                        icon: 'error',
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false,   
                        allowEscapeKey: false,
                        willOpen: () => setIsMouseOverComponent(true), 
                        willClose: () => setIsMouseOverComponent(false)  
                    });
                }else{
                    Swal.fire({
                        title: 'Error Desconocido',
                        text: otherError,
                        icon: 'error',
                        confirmButtonText: 'Continuar',
                        allowOutsideClick: false,   
                        allowEscapeKey: false,
                        willOpen: () => setIsMouseOverComponent(true), 
                        willClose: () => setIsMouseOverComponent(false) 
                    });
                }   
            }
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para actualizar el valor de "isMouseOverRef" en cada renderizado cuando cambia el estado de "isMouseOverComponent".
     * 1. "isMouseOverRef" utiliza "useRef" para mantener su valor entre renderizados sin desencadenar un re-render. Esto permite conservar el valor de 
     *    "isMouseOverComponent" de forma persistente, incluso cuando el componente se vuelve a renderizar.
     * 2. Cuando "isMouseOverComponent" cambia, este "useEffect" se ejecuta y asigna el valor actualizado de "isMouseOverComponent" a "isMouseOverRef.current". 
     *    Esto permite que "isMouseOverRef" siempre refleje el valor actual de "isMouseOverComponent".
     * 3. Al estar incluido "isMouseOverComponent" en el arreglo de dependencias, el "useEffect" se activará cada vez que este estado cambie, 
     *    garantizando que "isMouseOverRef" mantenga el valor sincronizado con "isMouseOverComponent".
    */

    useEffect(() => {
        isMouseOverRef.current = isMouseOverComponent; 
    }, [isMouseOverComponent]);

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para gestionar el evento de click en el mapa para obtener las coordenadas y mostrar el componente draggableModal.
     * 1. La funcion "handleMapClick" se define dentro del "useEffect" y se ejecuta cada vez que el usuario hace click en el mapa. Dentro de la misma, se
     *    verifica si "isMouseOverComponent" es falso, lo que indica que el click se realizó fuera de un componente referenciado.
     *    - Si "isMouseOverComponent" es falso, se obtienen las coordenadas (latitud y longitud) del punto seleccionado en el mapa utilizando 
     *      "e.latlng" y se almacenan en el estado "coordinatesResult" mediante "setCoordinatesResult".
     *    - Luego, "setIsDraggModalVisible" se establece en "true" para mostrar el componente draggableModal con las coordenadas seleccionadas.
     * 3. Se añade un listener para el evento "click" en el mapa, de modo que "handleMapClick" se ejecutará cada vez que se haga click en el mapa.
     * 4. El retorno de la funcion es una limpieza para eliminar el listener "click" del mapa cuando el componente se desmonta o cuando cambia alguna 
     *    dependencia del hook, evitando fugas de memoria y asegurando que el listener se quite correctamente cuando el "useEffect" se vuelva a ejecutar.
     * 5. Las dependencias de este "useEffect" son "map" e "isMouseOverComponent", por lo que el hook se ejecutará nuevamente cada vez que el mapa o 
     *    el valor de "isMouseOverComponent" cambien, manteniendo el estado de la función actualizado.
    */

    useEffect(() => {

        const handleMapClick = (e) => {
            if (!isMouseOverComponent) {
                const { lat, lng } = e.latlng;
                setCoordinatesResult({ lat, lng });
                setIsDraggModalVisible(true);
            }
        };
    
        map.on('click', handleMapClick);
    
        return () => {
            map.off('click', handleMapClick);
        };

    }, [map, isMouseOverComponent]);

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handlePTMLayer: Sirve para gestionar la visualización y comportamiento de la capa de PTM en el mapa, permitiendo renderizarla, actualizar su 
     * opacidad y obtener los valores de la misma al hacer click en el mapa.
     * 1. La función recibe dos parámetros:
     *    - "layerName": Nombre de la capa a gestionar localmente (en este caso, 'PTM').
     *    - "geoserverLayer": Nombre de la capa en el servidor GeoServer correspondiente a "layerName".
     * 2. El primer "useEffect" se encarga de gestionar la creación y visualización de la capa PTM en el mapa.
     *    2.1. Primero se verifica si la capa PTM ya existe en el objeto "layers" de referencias. Si no existe, se crea una nueva instancia de la capa desde 
     *         GeoServer y la almacena en "layers.current" para evitar recrearla.
     *    2.2. La función "updateLayer" gestiona la visibilidad de la capa PTM:
     *         - Si el switch de la capa PTM ("PTMlayerSwitch") se activa, y la capa no está renderizada en el mapa, se la añade al mismo.
     *         - Si el switch se desactiva, y la capa está renderizada en el mapa, se la elimina y no se visualiza en el mapa.
     *    2.3. La función "handleMapClick" obtiene los datos de la capa PTM al hacer click en el mapa. Primero verifica si el mouse está sobre el componente 
     *         "isMouseOverRef" o si la capa PTM no está activada, en cuyo caso sale de la función. Luego obtiene las coordenadas del punto seleccionado y 
     *         establece el valor en "coordinatesResult". Despues realiza una solicitud al servidor GeoServer para obtener el valor de la capa PTM en las
     *         coordenadas seleccionadas:
     *         - Si la respuesta contiene datos, se extrae el valor de "GRAY_INDEX" y se establece en "PTMResult" si es válido, seteando vacio a 
     *           "notFoundPTMResults".
     *         - Si los datos son iguales a -9999.900390625 se asigna "null" en "PTMResult" y "S/D" en "notFoundPTMResults" para indicar que no hay datos.
     *         - En caso de error, se muestra el mismo en "notFoundPTMResults".
     *    2.4. El listener "click" se añade al mapa para que "handleMapClick" se ejecute en cada clic.
     *    2.5. Al desmontarse el componente o cuando cambia alguna dependencia, se limpia el listener de "click" y se elimina la capa del mapa si estaba 
     *         presente.
     * 3. El segundo "useEffect" actualiza la opacidad de la capa PTM cuando cambia "layerOpacity". Si la capa está visible en el mapa, se ajusta su opacidad 
     *    al valor de "layerOpacity" actual.
     * 4. Las dependencias de estos "useEffect" son "map" y "PTMlayerSwitch" para el primero y "layerOpacity" para el segundo, de manera que se reactiven 
     *    cuando alguno de estos valores cambie, manteniendo el estado de la capa actualizado.
    */

    const handlePTMLayer = (layerName, geoserverLayer) => {

        useEffect(() => {
            if (!layers.current[layerName]) {
                const layer = L.Geoserver.wms(import.meta.env.VITE_GEOSERVER_DATA_URL, {
                    layers: geoserverLayer,
                    opacity: layerOpacity[layerName], 
                    format: 'image/png',
                    zIndex: 800,
                });
                layers.current[layerName] = layer;
            }
    
            const layer = layers.current[layerName];
    
            const updateLayer = () => {
                if (PTMlayerSwitch[layerName]) {
                    if (!map.hasLayer(layer)) {
                        map.addLayer(layer);
                    }
                } else {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            };
    
            const handleMapClick = async (e) => {
            
                if (isMouseOverRef.current) {
                    return;  
                }

                if (!PTMlayerSwitch[layerName]) {
                    return; 
                }

                const { lat, lng } = e.latlng;
                setCoordinatesResult({ lat, lng });

                try {
                    
                    const url = `${import.meta.env.VITE_GEOSERVER_DATA_URL}?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=EHCPA:PTM_Raster&query_layers=EHCPA:PTM_Raster&info_format=application/json&bbox=${map.getBounds().toBBoxString()}&width=${map.getSize().x}&height=${map.getSize().y}&srs=EPSG:4326&x=${Math.floor(e.containerPoint.x)}&y=${Math.floor(e.containerPoint.y)}`;
    
                    const response = await axios.get(url);
    
                    if (response.data.features && response.data.features.length > 0) {
                        const value = response.data.features[0].properties.GRAY_INDEX; 
                        if(value ==  -9999.900390625){
                            setPTMResult(null);
                            setNotFoundPTMResults("S/D");
                        }else{
                            setPTMResult(value);
                            setNotFoundPTMResults("");
                        }
                    } else {
                        setPTMResult(null);
                        setNotFoundPTMResults("S/D");
                    }
                } catch (error) {
                    setPTMResult(null);
                    setNotFoundPTMResults(`Error: ${error.message}`);
                }
            };
    
            map.on('click', handleMapClick);
    
            updateLayer();
    
            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            
                map.off('click', handleMapClick);
            };
        }, [map, PTMlayerSwitch[layerName]]);
    
        
        useEffect(() => {
            const layer = layers.current[layerName];
            if (map.hasLayer(layer)) {
                layer.setOpacity(layerOpacity[layerName]);
            }
        }, [layerOpacity[layerName]]);

    };
    
    handlePTMLayer('PTM', 'EHCPA:PTM_Raster');

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleSPILayers: Sirve para gestionar la visualización y comportamiento de las capas de SPI en el mapa, permitiendo renderizarlas, actualizar 
     * sus opacidades y obtener los valores de las mismas al hacer click en el mapa.
     * 1. La función recibe dos parámetros:
     *    - "layerName": Nombre de la capa SPI que se va a gestionar localmente (por ejemplo, 'SPI_1').
     *    - "geoserverLayer": Nombre de la capa en el servidor GeoServer correspondiente a "layerName".
     * 2. El primer "useEffect" se encarga de gestionar la creación y visualización de cada capa SPI en el mapa.
     *    2.1. Primero se verifica si la capa SPI especificada ya existe en el objeto "layers" de referencias. Si no existe, crea una nueva instancia de la 
     *         capa desde GeoServer y la almacena en "layers.current" para evitar recrearla.
     *    2.2. La función "updateLayer" gestiona la visibilidad de cada capa:
     *         - Si el switch de la capa SPI ("SPIlayersSwitches") se activa, y la capa no está renderizada en el mapa, se la añade al mismo.
     *         - Si el switch se desactiva, y la capa está renderizada en el mapa, se la elimina y no se visualiza en el mapa.
     *    2.3. La función "handleMapClick" obtiene los datos de la capa SPI al hacer click en el mapa. Primero verifica si el mouse está sobre el componente 
     *         usando "isMouseOverRef", o si la capa SPI no está activada, en cuyo caso sale de la función. Luego obtiene las coordenadas del punto seleccionado 
     *         y las guarda en "coordinatesResult". Despues realiza una solicitud a GeoServer para obtener el valor de la capa SPI en las coordenadas seleccionadas:
     *         - Si la respuesta contiene datos, se extrae el valor de "GRAY_INDEX" y se establece en "SPIResults" si es válidoseteando vacio a "notFoundSPIResults".
     *         - Si los datos son iguales a "null", se asigna "null" en "SPIResults" y "S/D" en "notFoundSPIResults" para indicar que no hay datos.
     *         - En caso de error, se muestra el mismo en "notFoundSPIResults".
     *    2.4. El listener "click" se añade al mapa para que "handleMapClick" se ejecute en cada clicK.
     *    2.5. Al desmontarse el componente o cuando cambia alguna dependencia, se limpia el listener de "click" y se elimina la capa del mapa si estaba 
     *         presente.
     * 3. El segundo "useEffect" actualiza la opacidad de la capa SPI cuando cambia "layerOpacity". Si la capa está visible en el mapa, se ajusta su opacidad 
     *    al valor de "layerOpacity" actual.
     * 4. Las dependencias de estos "useEffect" son "map" y "SPIlayersSwitches" para el primero, y "layerOpacity]" para el segundo, de manerao que se reactiven
     *    cuando alguno de estos valores cambie, manteniendo el estado de la capa actualizado.
    */

    const handleSPILayers = (layerName, geoserverLayer) => {
        useEffect(() => {
            if (!layers.current[layerName]) {
                const layer = L.Geoserver.wms(import.meta.env.VITE_GEOSERVER_DATA_URL, {
                    layers: geoserverLayer,
                    opacity: layerOpacity[layerName], 
                    format: 'image/png',
                    zIndex: 1000,
                });
                layers.current[layerName] = layer;
            }
    
            const layer = layers.current[layerName];
    
            const updateLayer = () => {
                if (SPIlayersSwitches[layerName]) {
                    if (!map.hasLayer(layer)) {
                        map.addLayer(layer);
                    }
                } else {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                }
            };
    
            const handleMapClick = async (e) => {

                if (isMouseOverRef.current) {
                    return;  
                }

                if (!SPIlayersSwitches[layerName]) {
                    return; 
                }
                
                const { lat, lng } = e.latlng;
                setCoordinatesResult({ lat, lng });

                try {
                    const url = `${import.meta.env.VITE_GEOSERVER_DATA_URL}?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=${geoserverLayer}&query_layers=${geoserverLayer}&info_format=application/json&bbox=${map.getBounds().toBBoxString()}&width=${map.getSize().x}&height=${map.getSize().y}&srs=EPSG:4326&x=${Math.floor(e.containerPoint.x)}&y=${Math.floor(e.containerPoint.y)}`;
    
                    const response = await axios.get(url);
    
                    if (response.data.features && response.data.features.length > 0) {
                        const value = response.data.features[0].properties.GRAY_INDEX;
                        if (value !== null) {
                            setSPIResults((prevState) => ({
                                ...prevState,
                                [layerName]: value,
                            }));
                            setNotFoundSPIResults((prevState) => ({
                                ...prevState,
                                [layerName]: "",
                            }));
                        } else {
                            setSPIResults((prevState) => ({
                                ...prevState,
                                [layerName]: null,
                            }));
                            setNotFoundSPIResults((prevState) => ({
                                ...prevState,
                                [layerName]: "S/D",
                            }));
                        }
                    } else {
                        setSPIResults((prevState) => ({
                            ...prevState,
                            [layerName]: null
                        }));
                        setNotFoundSPIResults((prevState) => ({
                            ...prevState,
                            [layerName]: "S/D",
                        }));
                    }
                } catch (error) {
                    setSPIResults((prevState) => ({
                        ...prevState,
                        [layerName]: null
                    }));
                    setNotFoundSPIResults((prevState) => ({
                        ...prevState,
                        [layerName]: `Error en ${layerName}: ${error.message}`,
                    }));
                }
            };
    
            map.on('click', handleMapClick);
    
            updateLayer();
    
            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
                
                map.off('click', handleMapClick);
            };
        }, [map, SPIlayersSwitches[layerName]]);
    
        useEffect(() => {
            const layer = layers.current[layerName];
            if (map.hasLayer(layer)) {
                layer.setOpacity(layerOpacity[layerName]);
            }
        }, [layerOpacity[layerName]]);
    };
    
    
    handleSPILayers('SPI_1', 'EHCPA:SPI_scale_1_Raster');
    handleSPILayers('SPI_2', 'EHCPA:SPI_scale_2_Raster');
    handleSPILayers('SPI_3', 'EHCPA:SPI_scale_3_Raster');
    handleSPILayers('SPI_6', 'EHCPA:SPI_scale_6_Raster');
    handleSPILayers('SPI_9', 'EHCPA:SPI_scale_9_Raster');
    handleSPILayers('SPI_12', 'EHCPA:SPI_scale_12_Raster');
    handleSPILayers('SPI_24', 'EHCPA:SPI_scale_24_Raster');
    handleSPILayers('SPI_36', 'EHCPA:SPI_scale_36_Raster');
    handleSPILayers('SPI_48', 'EHCPA:SPI_scale_48_Raster');
    handleSPILayers('SPI_60', 'EHCPA:SPI_scale_60_Raster');
    handleSPILayers('SPI_72', 'EHCPA:SPI_scale_72_Raster');

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleOpacityChange: Sirve para actualizar el nivel de opacidad de una capa específica en el mapa, permitiendo modificar la transparencia de 
     * forma individual.
     * 1. La función recibe dos parámetros:
     *    - "layer": Nombre de la capa cuya opacidad se va a cambiar.
     *    - "value": Nuevo valor de opacidad para la capa, representado como un número decimal entre 0 y 1, donde 0 es completamente transparente y 1 
     *      es completamente opaco.
     * 2. A través de "setLayerOpacity", se actualiza el estado de "layerOpacity" que contiene los valores de opacidad de todas las capas:
     *    2.1. La función recibe el estado anterior ("prevState") y crea un nuevo objeto que copia todos los valores de opacidad actuales de "prevState" 
     *         usando el operador de propagación (...).
     *    2.2. Luego, actualiza solo la opacidad de la capa especificada en "layer" con el nuevo valor "value", sin afectar los valores de opacidad de 
     *         las demás capas.
     * 3. Esta actualización permite que el "useEffect" correspondiente a cada capa en el mapa detecte los cambios en "layerOpacity" y aplique la nueva 
     *    opacidad en el mapa, garantizando que cada capa mantenga su transparencia de acuerdo con el valor seleccionado.
    */

    const handleOpacityChange = (layer, value) => {
        setLayerOpacity((prevState) => ({
            ...prevState,
            [layer]: value
        }));
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handlePrecipitationNavbarSwitchChange: Sirve para gestionar el switch del navbar del modal de precipitacion del menu. Este, al ser el switch 
     * global, permite controlar el estado del switch de la capa de PTM en este caso. Si hubiera otras capas incluidas, tambien se verian afectadas.
     * 1. La función recibe un parámetro:
     *    - "checked": Valor booleano que indica el estado del switch global del navbar de precipitación. Si es "true", el switch está activado, y si es 
     *      "false", está desactivado. Por defecto, el valor es "true" ya que queremos que la capa de PTM este siempre activada al iniciar el sitio web.
     * 2. A través de "setIsPrecipitationNavbarSwitchChecked", se actualiza el estado "isPrecipitationNavbarSwitchChecked" con el valor de "checked":
     *    - Si se activa el switch global, "isPrecipitationNavbarSwitchChecked" se actualiza a "true", y actualiza el estado "PTMlayerSwitch" al mismo
     *      que al del switch global, en este caso "true", activando asi el switch de la capa PTM y haciendola visible en el mapa.
     *    - Si se desactiva el switch global, "isPrecipitationNavbarSwitchChecked" se actualiza a "false", y actualiza el estado "PTMlayerSwitch" al mismo
     *      que al del switch global, en este caso "false", desactivando asi el switch de la capa PTM y ocultandola en el mapa.
     * 3. Por otro lado, si el switch global se establece en "false", se ocultan los valores de PTM:
     *    3.1. "setPTMResult" se actualiza a "null", indicando que no hay valores visibles para la capa PTM.
     *    3.2. "setNotFoundPTMResults" se actualiza a una cadena vacía, limpiando cualquier mensaje de datos no encontrados.
    */

    const handlePrecipitationNavbarSwitchChange = (checked) => {
        setIsPrecipitationNavbarSwitchChecked(checked);
        setPTMLayerSwitch({
            PTM: checked
        });

        if (!checked) {
            setPTMResult(null);
            setNotFoundPTMResults("");
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handlePTMLayerSwitchChange: Sirve para gestionar el cambio de estado del switch de la capa PTM, permitiendo activar o desactivar su 
     * visualización en el mapa de forma independiente.
     * 1. La función recibe dos parámetros:
     *    - "layer": Nombre de la capa que se va a gestionar (en este caso, 'PTM').
     *    - "checked": Valor booleano que indica el estado del switch de la capa PTM. Si es "true", el switch está activado y la capa esta visible, y si es 
     *      "false", el switch está desactivado y la capa oculta.
     * 2. A través de "setPTMLayerSwitch", se actualiza el estado "PTMlayerSwitch" para reflejar el nuevo estado del switch:
     *    2.1. La función recibe el estado anterior de "PTMlayerSwitch" ("prevState") y crea un nuevo objeto copiando los valores actuales de las capas con 
     *         el operador de propagación (...).
     *    2.2. Luego, actualiza solo el valor de la capa específica (en este caso, 'PTM') con el nuevo valor de "checked", sin afectar los valores de otras 
     *         capas, si existieran.
     * 3. Si el switch de la capa PTM se desactiva (checked = false):
     *    3.1. "setPTMResult" se actualiza a "null", indicando que no hay valores visibles para la capa PTM en el mapa.
     *    3.2. "setNotFoundPTMResults" se actualiza a una cadena vacía, limpiando cualquier mensaje de datos no encontrados de PTM.
    */

    const handlePTMLayerSwitchChange = (layer, checked) => {
        setPTMLayerSwitch((prevState) => ({
            ...prevState,
            [layer]: checked
        }));

        if (!checked) {
            setPTMResult(null);
            setNotFoundPTMResults("");
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleSPINavbarSwitchChange: Sirve para gestionar el switch del navbar del modal de SPI del menu. Este, al ser el switch global, permite 
     * controlar el estado del switch de todas las capas de SPI en este caso.
     * 1. La función recibe un parámetro:
     *    - "checked": Valor booleano que indica el estado del switch global del navbar de SPI. Si es "true", el switch está activado, y si es "false", está 
     *      desactivado.
     * 2. A través de "setIsSPINavbarSwitchChecked", se actualiza el estado "isSPINavbarSwitchChecked" con el valor de "checked":
     *    - Si se activa el switch global, "isSPINavbarSwitchChecked" se actualiza a "true", y actualiza el estado "SPIlayersSwitches" al mismo que al del 
     *      switch global, en este caso "true", activando asi el switch de todas las capas SPI y haciendolas visibles en el mapa.
     *    - Si se desactiva el switch global, "isSPINavbarSwitchChecked" se actualiza a "false", y actualiza el estado "SPIlayersSwitches" al mismo que al 
     *      del switch global, en este caso "false", desactivando asi el switch de todas las capas SPI y ocultandolas en el mapa.
     * 3. Por otro lado, si el switch global se establece en "false", se ocultan los valores de SPI:
     *    3.1. Se define un arreglo "layers" que contiene los nombres de todas las capas SPI.
     *    3.2. "setSPIResults" actualiza el estado de "SPIResults" estableciendo el valor de cada capa SPI en "null", indicando que no hay datos visibles 
     *         para esas capas en el mapa.
     *    3.3. "setNotFoundSPIResults" actualiza "notFoundSPIResults" para cada capa SPI, limpiando cualquier mensaje de datos no encontrados.
     */

    const handleSPINavbarSwitchChange = (checked) => {
        setIsSPINavbarSwitchChecked(checked);
        setSPILayersSwitches({
            SPI_1: checked,
            SPI_2: checked,
            SPI_3: checked,
            SPI_6: checked,
            SPI_9: checked,
            SPI_12: checked,
            SPI_24: checked,
            SPI_36: checked,
            SPI_48: checked,
            SPI_60: checked,
            SPI_72: checked
        });

        if (!checked) {
            const layers = [
                'SPI_1', 'SPI_2', 'SPI_3', 'SPI_6', 'SPI_9', 'SPI_12',
                'SPI_24', 'SPI_36', 'SPI_48', 'SPI_60', 'SPI_72'
            ];
    
            setSPIResults((prevState) => {
                const updatedResults = { ...prevState };
                layers.forEach((layer) => {
                    updatedResults[layer] = null;
                });
                return updatedResults;
            });
    
            setNotFoundSPIResults((prevState) => {
                const updatedNotFoundResults = { ...prevState };
                layers.forEach((layer) => {
                    updatedNotFoundResults[layer] = "";
                });
                return updatedNotFoundResults;
            });
        }
        
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleSPILayerSwitchChange: Sirve para gestiona el cambio de estado del switch específico de cada capa SPI, permitiendo activar o desactivar 
     * la visualización de cada capa SPI de forma independiente en el mapa.
     * 1. La función recibe dos parámetros:
     *    - "layer": Nombre de la capa SPI que se va a gestionar (por ejemplo, 'SPI_1').
     *    - "checked": Valor booleano que indica el estado del switch de la capa. Si es "true", el switch está activado y la capa esta visible, y si es
     *      "false", el switch está desactivado y la capa oculta.
     * 2. A través de "setSPILayersSwitches", se actualiza el estado "SPIlayersSwitches" para reflejar el nuevo estado del switch de la capa seleccionada:
     *    2.1 La función recibe el estado anterior de "SPIlayersSwitches" ("prevState") y crea un nuevo objeto que copia los valores actuales de todas 
     *        las capas SPI con el operador de propagación (...).
     *    2.2. Luego, actualiza el valor del switch específico de la capa ("layer") con el nuevo valor "checked", sin afectar el estado de otras capas.
     * 3. Si el switch de la capa específica se desactiva (checked = false):
     *    3.1. "setSPIResults" actualiza el estado de "SPIResults", estableciendo el valor de la capa seleccionada en "null" para indicar que no hay datos 
     *         visibles para esa capa.
     *    3.2. "setNotFoundSPIResults" actualiza "notFoundSPIResults" para la capa seleccionada, limpiando cualquier mensaje de datos no encontrados.
    */

    const handleSPILayerSwitchChange = (layer, checked) => {
        setSPILayersSwitches((prevState) => ({
            ...prevState,
            [layer]: checked
        }));

       
        if (!checked) {
            setSPIResults((prevState) => ({
                ...prevState,
                [layer]: null,
            }));

            setNotFoundSPIResults((prevState) => ({
                ...prevState,
                [layer]: "",
            }));
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleOpenMenu: Sirve para gestionar la apertura y cierre del menu de botones.
     * 1. La función recibe un parámetro:
     *    - "e": Evento "onClick" generado al hacer clic en el botón de menú. Este evento se utiliza para crear el efecto ripple y detener la propagación 
     *      del evento.
     * 2. Mediante "setIsMenuOpen" se invierte el estado actual de "isMenuOpen":
     *    - Si "isMenuOpen" es "true", se establece en "false" para cerrar el menú.
     *    - Si "isMenuOpen" es "false", se establece en "true" para abrir el menú, permitiendo visualizar sus opciones.
     * 3. A través de "createRipple(e)", se aplica el efecto visual ripple sobre el botón de menú.
     * 4. Con "setIsMouseOverComponent" se establece en "true" para indicar que el mouse está sobre el componente evitando la colocacion del marker y el 
     *    calculo de coordenadas.
     * 5. "e.stopPropagation()" se utiliza para detener la propagación del evento "onClick" a elementos superiores, asegurando que solo se active el evento 
     *    sobre el botón de menú y evitando acciones no deseadas en componentes superiores.
     * 6. Los estados "isPrecipitationOpen", "isSPIOpen", e "isInfoMapOpen" se establecen en "false" para cerrar cualquier otro submenú o modal abierto, 
     *    asegurando que al abrir el menú principal, los otros elementos estén ocultos y el usuario pueda enfocarse solo en el menú.
    */

    const handleOpenMenu = (e) => {
        setIsMenuOpen(!isMenuOpen);
        createRipple(e)
        setIsMouseOverComponent(true);
        e.stopPropagation();
        setIsPrecipitationOpen(false);
        setIsSPIOpen(false);
        setIsInfoMapOpen(false);
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handlePrecipitationOpen: Sirve para gestionar la apertura y cierre del submenu o modal de precipitación dentro del menú principal, al hacer
     * click sobre el icono de lluvia.
     * 1. La función recibe un parámetro:
     *    - "e": Evento "onClick" generado al hacer click en el botón de precipitación. Este evento se utiliza para crear el efecto ripple y detener la 
     *      propagación del evento.
     * 2. "setIsPrecipitationOpen" alterna el estado de "isPrecipitationOpen":
     *    - Si el estado actual de "isPrecipitationOpen" es "true", el submenu de precipitación esta visible, y al hacer click sobre el boton se actualiza 
     *      el estado de "isPrecipitationOpen" a "false" para cerrar el modal.
     *    - Si el estado actual de "isPrecipitationOpen" es "false", el submenu de precipitación esta oculto, y al hacer click sobre el boton se actualiza 
     *      el estado de "isPrecipitationOpen" a "true" para abrir el modal.
     * 3. A través de "createRipple(e)", se aplica el efecto visual ripple sobre el botón de precipitación.
     * 4. "e.stopPropagation()" se utiliza para detener la propagación del evento "onClick" hacia componentes superiores, asegurando que solo se active el 
     *    evento en el botón de precipitación y evitando efectos no deseados en el menú principal u otros componentes.
    */

    const handlePrecipitationOpen = (e) => {
        setIsPrecipitationOpen(!isPrecipitationOpen);
        createRipple(e)
        e.stopPropagation(); 
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion closePrecipitationContainer: Sirve para cerrar el submenú o modal de precipitación.
     * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
     * 2. Directamente se actualiza el estado "isPrecipitationOpen" a "false", para cerrar el modal de precipitación si estaba abierto, al hacer click en
     *    el icono de "X" del mismo.
    */

    const closePrecipitationContainer = () => {
        setIsMouseOverComponent(false);
        setIsPrecipitationOpen(false);
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleSPIOpen: Sirve para gestionar la apertura y cierre del submenu o modal de SPI dentro del menú principal, al hacer click sobre el icono 
     * de SPI.
     * 1. La función recibe un parámetro:
     *    - "e": Evento "onClick" generado al hacer click en el botón de precipitación. Este evento se utiliza para crear el efecto ripple y detener la 
     *      propagación del evento.
     * 2. "setIsSPIOpen" alterna el estado de "isSPIOpen":
     *    - Si el estado actual de "isSPIOpen" es "true", el submenu de SPI esta visible, y al hacer click sobre el boton se actualiza el estado de "isSPIOpen"
     *      a "false" para cerrar el modal.
     *    - Si el estado actual de "isSPIOpen" es "false", el submenu de SPI esta oculto, y al hacer click sobre el boton se actualiza el estado de "isSPIOpen" 
     *      a "true" para abrir el modal.
     * 3. A través de "createRipple(e)", se aplica el efecto visual ripple sobre el botón de precipitación.
     * 4. "e.stopPropagation()" se utiliza para detener la propagación del evento "onClick" hacia componentes superiores, asegurando que solo se active el 
     *    evento en el botón de precipitación y evitando efectos no deseados en el menú principal u otros componentes.
    */

    const handleSPIOpen = (e) => {
        setIsSPIOpen(!isSPIOpen);
        createRipple(e);
        e.stopPropagation();
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion closeSPIContainer: Sirve para cerrar el submenú o modal de SPI.
     * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
     * 2. Directamente se actualiza el estado "isSPIOpen" a "false", para cerrar el modal de SPI si estaba abierto, al hacer click en el icono de "X" del mismo.
    */

    const closeSPIContainer = () => {
        setIsMouseOverComponent(false);
        setIsSPIOpen(false);
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion fetchDates: Sirve para realiza una solicitud al backend para obtener la fecha actual, la fecha de la ultima banda y la fecha de fin de 
     * calibracion.
     * 1. La función es asincrónica para manejar la solicitud de datos de forma no bloqueante.
     * 2. Dentro del bloque "try", se envía una solicitud "GET" al endpoint definido en `import.meta.env.VITE_BACKEND_GET_DATES_URL`:
          2.1. Si la solicitud es exitosa, se obtiene un objeto de respuesta que contiene las fechas. Y mediante "setDates" se actualiza el estado de "dates" 
               con los datos obtenidos, permitiendo que el modal informativo del mapa pueda mostrar la información de dichas fechas.
     * 3. En el bloque "catch", se maneja cualquier error que ocurra durante la solicitud. Si hay un error de conexion con el backend, "setDates" establece 
          valores predeterminados de "No_Disponible" para las fechas, indicando que no se pudieron obtener los datos desde el backend.
    */

    const fetchDates = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_GET_DATES_URL); 
            setDates(response.data);
        } catch (error) {
            setDates({
                today_day: "No_Disponible",
                today_month: "No_Disponible",
                today_year: "No_Disponible",
                last_band_day: "No_Disponible",
                last_band_month: "No_Disponible",
                last_band_year: "No_Disponible",
                calibration_date: "No_Disponible"
            });
        }
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleOpenInfoMap: Sirve para gestionar la apertura del modal informativo del mapa.
     * 1. La función es asincrónica para permitir la ejecución de la función "fetchDates" sin bloquear el flujo del programa.
     * 2. Con "setIsInfoMapOpen" se establece al estado "isInfoMapOpen" en "true" cuando se hace click sobre el icono de info, provocando que el modal
     *    informativo se haga visible.
     * 3. "createRipple(e)" aplica un efecto visual ripple sobre el botón que activa el modal informativo.
     * 4. Se llama a "fetchDates()" para obtener las fechas relevantes desde el backend. Esto permite que, al abrirse el modal informativo, las fechas
     *    actualizadas estén disponibles y visibles en el modal.
    */

    const handleOpenInfoMap = async (e) => {
        setIsInfoMapOpen(true);
        createRipple(e)
        await fetchDates();
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion handleCloseInfoMap: Sirve para cerrar el modal informativo del mapa.
     * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
     * 2. Directamente se actualiza el estado "isInfoMapOpen" a "false", para cerrar el modal informativo si estaba abierto, al hacer click en el icono de 
     *    "X" del mismo.
    */

    const handleCloseInfoMap = () => {
        setIsInfoMapOpen(false);
        setIsMouseOverComponent(false)
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion closeDraggModal: Sirve para cerrar el dragg modal que permite visualizar los valores de PTM, SPI y las coordenadas al hacer click en un punto 
     * del mapa.
     * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
     * 2. Directamente se actualiza el estado "isDraggModalVisible" a "false", para cerrar el modal si estaba abierto, al hacer click en el icono de "X" del 
     *    mismo.
    */
   
    const closeDraggModal = () => {
        setIsMouseOverComponent(false);
        setIsDraggModalVisible(false);
    };

    /*******************************************************************************************************************************************************/

    /**
     * Funcion bindModal: Sirve para configurar y controlar el comportamiento de arrastre del modal de valores, restringiendo su posición dentro de los 
     * límites de la ventana.
     * 1. Se utiliza el hook "useDrag" para habilitar la funcionalidad de arrastre en el modal. Esta funcion recibe el parámetro "offset", que representa el 
     *    desplazamiento en el arrastre:
     *    - "newPosition": Calcula la nueva posición del modal sumando "offset" a las coordenadas actuales de "modalPositionRef.current".
     *    - "modalWidth" y "modalHeight": Obtienen las dimensiones del modal a través de "modalRef.current". Si no se encuentran, se asignan valores 
     *      predeterminados de 510 (ancho) y 307 (alto) respectivamente.
     *    - "windowWidth" y "windowHeight": obtienen las dimensiones de la ventana del navegador, para establecer límites al arrastre.
     *    - "boundedX" y "boundedY": calculan la nueva posición del modal dentro de los límites de la ventana.
     *       - "boundedX": asegura que la posición en el eje X esté entre 0 y el ancho de la ventana menos el ancho del modal.
     *       - "boundedY": asegura que la posición en el eje Y esté entre 90 (límite superior) y el alto de la ventana menos el alto del modal.
     * 2. "setModalPosition" actualiza el estado de "modalPosition" con "boundedX" y "boundedY", restringiendo así el modal dentro de la ventana.
     * 3. El objeto de configuración de "useDrag" define dos propiedades adicionales:
     *    - "onDragEnd": Se ejecuta cuando el arrastre finaliza, y lo que hace es actualizar "modalPositionRef.current" con la posición final de "modalPosition", 
     *      asegurando que la referencia del modal mantenga su posición actual.
     *    - "from": Define la posición inicial del arrastre en función de "modalPositionRef.current.x" y "modalPositionRef.current.y", permitiendo que el 
     *      arrastre inicie desde la última posición registrada del modal.
    */

    const bindModal = useDrag(({ offset }) => {
        const newPosition = {
            x: modalPositionRef.current.x + offset[0],
            y: modalPositionRef.current.y + offset[1],
        };
    
        const modalWidth = modalRef.current ? modalRef.current.offsetWidth : 510; 
        const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 307; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        const boundedX = Math.min(Math.max(newPosition.x, 0), windowWidth - modalWidth);
        const boundedY = Math.min(Math.max(newPosition.y, 90), windowHeight - modalHeight);
    
        setModalPosition({
            x: boundedX,
            y: boundedY,
        });
    }, {
        onDragEnd: () => {
            modalPositionRef.current = modalPosition;
        },
        from: () => [modalPositionRef.current.x, modalPositionRef.current.y]
    });

    /*******************************************************************************************************************************************************/
    
    /**
     * Funcion handleCopyValues: Sirve para copiar las coordenadas seleccionadas y los valores de PTM y SPI presentes en el dragg modal.
     * 1. Se inicializa "copyText" como una cadena que contiene las coordenadas de latitud y longitud, redondeadas a tres decimales, del punto seleccionado 
     *    en el mapa.
     * 2. Luego, si la capa PTM está activada, se verifica que:
     *    - Si "PTMResult" contiene un valor, se agrega a la variable "copyText" el valor de PTM redondeado a un decimal.
     *    - Si no hay valor disponible, se agrega directamente "S/D" a la variable "copyText" para indicar que no se encontraron datos.
     * 3. Se recorren todas las capas SPI en "SPIResults" usando "Object.keys(SPIResults)". Y para cada capa SPI activada, se verifica que:
     *    - Si la capa SPI tiene datos, se agrega a la variable "copyText" su valor redondeado a un decimal.
     *    - Si la capa SPI no tiene datos, se agrega "S/D" a la variable "copyText" para indicar que no hay datos disponibles.
     * 4. Si "copyText" contiene texto para copiar, se ejecuta "navigator.clipboard.writeText(copyText)" para copiar el contenido de "copyText" al portapapeles.
     *    4.1. Si la copia es exitosa, se establece "setIsCopied" en "true", para que al hacer click en el icono de copy, aparezca el icono de visto indicando
     *         que se copiaron los datos. Y después de 2,5 segundos, se restablece "isCopied" en "false", para volver a colocar el icono de copy.
    */

    const handleCopyValues = () => {
        let copyText = `Latitud: ${coordinatesResult.lat.toFixed(3)}, Longitud: ${coordinatesResult.lng.toFixed(3)}\n`;
    
        if (PTMlayerSwitch.PTM) {
            if (PTMResult !== null) {
                copyText += `PTM [mm]: ${PTMResult.toFixed(1)}\n`;
            } else {
                copyText += `PTM [mm]: S/D\n`;
            }
        }
    
        Object.keys(SPIResults).forEach((key) => {
            if (SPIlayersSwitches[key]) {
                if (SPIResults[key] !== null) {
                    copyText += `SPI Escala ${key.replace('SPI_', '')}: ${SPIResults[key].toFixed(1)}\n`;
                } else {
                    copyText += `SPI Escala ${key.replace('SPI_', '')}: S/D\n`;
                }
            }
        });
    
        const textarea = document.createElement('textarea');
        textarea.value = copyText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
    
        try {
            document.execCommand('copy');
            setIsCopied(true); 
            setTimeout(() => setIsCopied(false), 2500); 
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    
        document.body.removeChild(textarea);
    };

    /*******************************************************************************************************************************************************/

    return(
        <div ref={elementRef} onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="menuContainer">
                <button className='menuButton' onClick={handleOpenMenu} >
                    <FontAwesomeIcon 
                        className={`menuButtonIcons ${isMenuOpen ? 'rotate-right' : 'rotate-left'}`}
                        icon={isMenuOpen ? faXmark : faBars}
                    />
                </button>  
            </div>
            <MenuContent
                isMenuOpen={isMenuOpen}
                setIsMouseOverComponent={setIsMouseOverComponent}
                isPrecipitationOpen={isPrecipitationOpen}
                handlePrecipitationOpen={handlePrecipitationOpen}
                isSPIOpen={isSPIOpen}
                handleSPIOpen={handleSPIOpen}
                isDownloading={isDownloading}
                downloadProgress={downloadProgress}
                handleDownloadClick={handleDownloadClick}
                closePrecipitationContainer={closePrecipitationContainer}
                closeSPIContainer={closeSPIContainer}
                handlePrecipitationNavbarSwitchChange={handlePrecipitationNavbarSwitchChange}
                handlePTMLayerSwitchChange={handlePTMLayerSwitchChange}
                handleSPINavbarSwitchChange={handleSPINavbarSwitchChange}
                handleSPILayerSwitchChange={handleSPILayerSwitchChange}
                layerOpacity={layerOpacity}
                SPIlayersSwitches={SPIlayersSwitches}
                PTMlayerSwitch={PTMlayerSwitch}
                isPrecipitationNavbarSwitchChecked={isPrecipitationNavbarSwitchChecked}
                isSPINavbarSwitchChecked={isSPINavbarSwitchChecked}
                handleOpacityChange={handleOpacityChange}
                isInfoMapOpen={isInfoMapOpen}
                handleOpenInfoMap={handleOpenInfoMap}
                handleCloseInfoMap={handleCloseInfoMap}
            />
            {isInfoMapOpen && (
                <InfoMap 
                    handleCloseInfoMap={handleCloseInfoMap}
                    setIsMouseOverComponent={setIsMouseOverComponent}
                    todayDay={dates.today_day}
                    todayMonth={dates.today_month}
                    todayYear={dates.today_year}
                    lastBandDay={dates.last_band_day}
                    lastBandMonth={dates.last_band_month}
                    lastBandYear={dates.last_band_year}
                    calibrationDate={dates.calibration_date}
                /> 
            )}
            <DraggableModal
                isDraggModalVisible={isDraggModalVisible}
                setIsMouseOverComponent={setIsMouseOverComponent}
                modalPosition={modalPosition}
                bindModal={bindModal}
                modalRef={modalRef}
                closeDraggModal={closeDraggModal}
                coordinatesResult={coordinatesResult}
                isCopied={isCopied}
                handleCopyValues={handleCopyValues}
                PTMResult={PTMResult}
                notFoundPTMResults={notFoundPTMResults}
                PTMlayerSwitch={PTMlayerSwitch}
                SPIResults={SPIResults}
                SPIlayersSwitches={SPIlayersSwitches}
                notFoundSPIResults={notFoundSPIResults}
            />
        </div>
    )
};

export default MapMenu;

