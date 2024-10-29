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



const MapMenu = ({setIsMouseOverComponent, isMouseOverComponent}) => {
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
    const [wmsCuencasLayers, setWmsCuencasLayers] = useState(null);
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
    const [error, setError] = useState(null);
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
    useMapEventHandlers(elementRef, map, ['mousedown', 'mouseup', 'mousemove', 'wheel']);
    const createRipple = useRippleEffect();


    const handleDownloadClick = async (e) => {
        e.preventDefault();
        createRipple(e);
        setIsMouseOverComponent(true);

        const selectedLayers = [];
        
        // Si PTM está activado, lo agregamos
        if (PTMlayerSwitch.PTM) {
            selectedLayers.push('PTM');
        }
        
        // Verificamos cada capa SPI activada
        Object.keys(SPIlayersSwitches).forEach((key) => {
            if (SPIlayersSwitches[key]) {
                selectedLayers.push(key);  
            }
        });
    
        // Si no hay capas seleccionadas, mostramos un mensaje de alerta
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
            setIsDownloading(true); // Inicia la descarga
            setDownloadProgress(0);

            // Generamos la URL dinámica con las capas activadas
            const url = `${import.meta.env.VITE_BACKEND_DOWNLOAD_URL}/${selectedLayers.join(',')}`;
    
            // Hacemos la solicitud al backend
            const res = await axios.get(url, {
                responseType: 'blob', // Para recibir archivos binarios
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
                setIsDownloading(false); // Termina la descarga
                setDownloadProgress(null); // Reinicia el progreso después de la descarga
            }, 1200);

        } catch (error) { // Manejamos el error adecuadamente porque es un blob

            setIsDownloading(false); // Termina la descarga en caso de error
            setDownloadProgress(null);

            if (error.response && error.response.data) {
                const errorBlobText = await error.response.data.text();
                const errorMessage = JSON.parse(errorBlobText);
                setError(errorMessage.message);
                
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
                setError(otherError);
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




    useEffect(() => {
        isMouseOverRef.current = isMouseOverComponent; 
    }, [isMouseOverComponent]);



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
                    setNotFoundPTMResults(error);
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
                        [layerName]: `Error al obtener el valor del raster para ${layerName}: ${error.message}`,
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



    const handleOpacityChange = (layer, value) => {
        setLayerOpacity((prevState) => ({
            ...prevState,
            [layer]: value
        }));
    };


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


    const handleOpenMenu = (e) => {
        setIsMenuOpen(!isMenuOpen);
        createRipple(e)
        setIsMouseOverComponent(true);
        e.stopPropagation();
        setIsPrecipitationOpen(false);
        setIsSPIOpen(false);
        setIsInfoMapOpen(false);
    };

    const handlePrecipitationOpen = (e) => {
        setIsPrecipitationOpen((isPrecipitationOpen) => !isPrecipitationOpen);
        createRipple(e)
        e.stopPropagation(); 
    };

    const closePrecipitationContainer = () => {
        setIsMouseOverComponent(false);
        setIsPrecipitationOpen(false);
    };

    const handleSPIOpen = (e) => {
        setIsSPIOpen(!isSPIOpen);
        createRipple(e);
        e.stopPropagation();
    };


    const closeSPIContainer = () => {
        setIsMouseOverComponent(false);
        setIsSPIOpen(false);
    };

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


    const handleOpenInfoMap = async (e) => {
        setIsInfoMapOpen(true);
        createRipple(e)
        await fetchDates();
    };


    const handleCloseInfoMap = () => {
        setIsInfoMapOpen(false);
        setIsMouseOverComponent(false)
    };



    const closeModal = () => {
        setIsMouseOverComponent(false);
        setIsDraggModalVisible(false);
    };

    

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




    const [isCopied, setIsCopied] = useState(false);

    
    const handleCopyValues = () => {
        let copyText = `Latitud: ${coordinatesResult.lat.toFixed(3)}, Longitud: ${coordinatesResult.lng.toFixed(3)}\n`;
    
        // Copiamos el valor de PTM si está activado, o mostramos "S/D" si no hay datos
        if (PTMlayerSwitch.PTM) {
            if (PTMResult !== null) {
                copyText += `PTM [mm]: ${PTMResult.toFixed(1)}\n`;
            } else {
                copyText += `PTM [mm]: S/D\n`;  // Indica que no hay datos disponibles
            }
        }
    
        // Recorremos todos los valores de SPI, y si tienen datos, los agregamos o mostramos "S/D" si no tienen
        Object.keys(SPIResults).forEach((key) => {
            if (SPIlayersSwitches[key]) { // Si la capa SPI está activada
                if (SPIResults[key] !== null) {
                    copyText += `SPI Escala ${key.replace('SPI_', '')}: ${SPIResults[key].toFixed(1)}\n`;
                } else {
                    copyText += `SPI Escala ${key.replace('SPI_', '')}: S/D\n`;  // Indica que no hay datos disponibles
                }
            }
        });
    
        // Copiamos solo si hay algo que copiar
        if (copyText) {
            navigator.clipboard.writeText(copyText)
                .then(() => {
                    setIsCopied(true);
                    setTimeout(() => {
                        setIsCopied(false);
                    }, 2500);
                })
                .catch((err) => {
                    console.error('Error al copiar los datos: ', err);
                });
        }
    };


   


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
                closeModal={closeModal}
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

