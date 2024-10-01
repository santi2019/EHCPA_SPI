import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCheck, faCircleInfo, faDownload, faXmark} from "@fortawesome/free-solid-svg-icons";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import {Switch} from "antd";
import "./maprasterlayers.css";
import 'leaflet-geoserver-request';
import axios from 'axios';
import FileDownload from "js-file-download"
import Swal from 'sweetalert2' 
import {useDrag} from 'react-use-gesture';


const MapRasterLayers = ({setIsMouseOverComponent, isMouseOverComponent}) => {
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [wmsCuencasLayers, setWmsCuencasLayers] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPTMOpen, setIsPTMOpen] = useState(false);
    const [isPTMNavbarSwitchChecked, setIsPTMNavbarSwitchChecked] = useState(true);
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
    const modalInitialPosition = { x: 54, y: 105 };
    const modalPositionRef = useRef(modalInitialPosition);
    const [modalPosition, setModalPosition] = useState(modalPositionRef.current);
    const modalRef = useRef(null); 
    const [error, setError] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(null); 
    const [isDownloading, setIsDownloading] = useState(false);


    const handleDownloadClick = async (e) => {
        e.preventDefault();
    
        // Recopilamos los switches activados
        const selectedLayers = [];
        
        // Si PTM está activado, lo agregamos
        if (PTMlayerSwitch.PTM) {
            selectedLayers.push('PTM');
        }
        
        // Verificamos cada capa SPI activada
        Object.keys(SPIlayersSwitches).forEach((key) => {
            if (SPIlayersSwitches[key]) {
                selectedLayers.push(key);  // Ejemplo: 'SPI_1', 'SPI_6', etc.
            }
        });
    
        // Si no hay capas seleccionadas, mostramos un mensaje de alerta
        if (selectedLayers.length === 0) {
            Swal.fire({
                title: 'Oops!',
                text: 'Debe seleccionar al menos una capa para descargar.',
                icon: 'warning',
                confirmButtonText: 'Continuar'
            });
            return;
        }
    
        try {
            setIsDownloading(true); // Inicia la descarga
            setDownloadProgress(0);

            // Generamos la URL dinámica con las capas activadas
            const url = `http://127.0.0.1:8800/download/${selectedLayers.join(',')}`;
    
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
                    confirmButtonText: 'Continuar'
                });
            } else {
                const otherError = error.message;
                setError(otherError);
                console.error("Error:", otherError);
            }
        }
    };




    useEffect(() => {
        isMouseOverRef.current = isMouseOverComponent; 
    }, [isMouseOverComponent]);


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


    useEffect(() => {
        const handleMapClick = (e) => {
            if (!isMouseOverRef.current) {
                const { lat, lng } = e.latlng;
                setCoordinatesResult({ lat, lng });
                setIsModalVisible(true);
            }
        };
    
        map.on('click', handleMapClick);
    
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map]);


    const handlePTMLayer = (layerName, geoserverLayer) => {
        useEffect(() => {
            if (!layers.current[layerName]) {
                const layer = L.Geoserver.wms('http://localhost:8080/geoserver/EHCPA/wms', {
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
                    
                    const url = `http://localhost:8080/geoserver/EHCPA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=EHCPA:PTM_Raster&query_layers=EHCPA:PTM_Raster&info_format=application/json&bbox=${map.getBounds().toBBoxString()}&width=${map.getSize().x}&height=${map.getSize().y}&srs=EPSG:4326&x=${Math.floor(e.containerPoint.x)}&y=${Math.floor(e.containerPoint.y)}`;
    
                    const response = await axios.get(url);
    
                    if (response.data.features && response.data.features.length > 0) {
                        const value = response.data.features[0].properties.GRAY_INDEX; 
                        if(value ==  -9999.900390625){
                            setPTMResult(null);
                            setNotFoundPTMResults("No se encontraron datos para la ubicación seleccionada.");
                        }else{
                            setPTMResult(value);
                            setNotFoundPTMResults("");
                        }
                    } else {
                        setPTMResult(null);
                        setNotFoundPTMResults("No se encontraron datos para la ubicación seleccionada.");
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
                const layer = L.Geoserver.wms('http://localhost:8080/geoserver/EHCPA/wms', {
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
                    const url = `http://localhost:8080/geoserver/EHCPA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=${geoserverLayer}&query_layers=${geoserverLayer}&info_format=application/json&bbox=${map.getBounds().toBBoxString()}&width=${map.getSize().x}&height=${map.getSize().y}&srs=EPSG:4326&x=${Math.floor(e.containerPoint.x)}&y=${Math.floor(e.containerPoint.y)}`;
    
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
                                [layerName]: "No se encontraron datos para la ubicación seleccionada.",
                            }));
                        }
                    } else {
                        setSPIResults((prevState) => ({
                            ...prevState,
                            [layerName]: null
                        }));
                        setNotFoundSPIResults((prevState) => ({
                            ...prevState,
                            [layerName]: "No se encontraron datos para la ubicación seleccionada.",
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


    const handlePTMNavbarSwitchChange = (checked) => {
        setIsPTMNavbarSwitchChecked(checked);
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


    const handleOpenMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handlePTMOpen = () => {
        setIsPTMOpen(!isPTMOpen);
    };

    const handleSPIOpen = () => {
        setIsSPIOpen(!isSPIOpen);
    };

    const closePTMContainer = () => {
        setIsPTMOpen(false);
        setIsMouseOverComponent(false)
    };

    const closeSPIContainer = () => {
        setIsSPIOpen(false);
        setIsMouseOverComponent(false)
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setIsMouseOverComponent(false);
    };

    

    const bindModal = useDrag(({ offset }) => {
        const newPosition = {
            x: modalPositionRef.current.x + offset[0],
            y: modalPositionRef.current.y + offset[1],
        };
    
        const modalWidth = modalRef.current ? modalRef.current.offsetWidth : 510; 
        const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 295; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        const boundedX = Math.min(Math.max(newPosition.x, 0), windowWidth - modalWidth);
        const boundedY = Math.min(Math.max(newPosition.y, 95), windowHeight - modalHeight);
    
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

    const handleCopyCoordinates = () => {
        const coordinatesText = `Latitud: ${coordinatesResult.lat}, Longitud: ${coordinatesResult.lng}`;
        
        navigator.clipboard.writeText(coordinatesText)
            .then(() => {
                setIsCopied(true);
    
                setTimeout(() => {
                    setIsCopied(false);
                }, 2500);
            })
            .catch((err) => {
                console.error('Error al copiar las coordenadas: ', err);
            });
    };

    

    return(
        <div ref={elementRef} onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="bMenuContainer" >
                <button className='menuButton' onClick={handleOpenMenu} >
                    <FontAwesomeIcon className="menuIcon" icon={isMenuOpen ? faXmark : faBars}/>
                </button>  
            </div>
            {isMenuOpen && (
                <div className="menuContent" >
                    <ul className="menuItems">
                        <li className="menuItemsli">
                            <button className='bContent' onClick={handlePTMOpen}>
                                <span>PTM</span>
                            </button>
                        </li>
                        {isPTMOpen && (
                            <div className="PTMlayerContainer">
                                <div className="PTMNavbar" >
                                    <Switch checked={isPTMNavbarSwitchChecked} onChange={handlePTMNavbarSwitchChange}/>
                                    <h2 className="PTMNavarTitle">Precipitación Total Mensual</h2>
                                    <FontAwesomeIcon className="PTMcloseIcon" icon={faXmark}  onClick={closePTMContainer}/>
                                </div>
                                <div className="PTMlayerContent" >
                                    <ul className="PTMlayerItem">
                                        <li>
                                            <div className="PTMliSwitchText">
                                                <Switch checked={PTMlayerSwitch.PTM} onChange={(checked) => handlePTMLayerSwitchChange('PTM', checked)}/>
                                                <span>Precip. Total Mensual [mm]</span>
                                            </div>
                                            <div className="PTMliRange">
                                                <div className="PTMminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.PTM}
                                                onChange={(e) => handleOpacityChange('PTM', parseFloat(e.target.value))}/>
                                                <div className="PTMmaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        <li>
                            <button className='bContent' onClick={handleSPIOpen} >
                                <span>SPI</span>
                            </button> 
                        </li>
                        {isSPIOpen && (
                            <div className="SPIlayersContainer">
                                <div className="SPINavbar" >
                                    <Switch checked={isSPINavbarSwitchChecked} onChange={handleSPINavbarSwitchChange}/>
                                    <h2 className="SPINavarTitle">Índice de Precipitación Estandarizado</h2>
                                    <FontAwesomeIcon className="SPIcloseIcon" icon={faXmark}  onClick={closeSPIContainer}/>
                                </div>
                                <div className="SPIlayersContent" >
                                    <ul className="SPIlayersItem">
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_1} onChange={(checked) => handleSPILayerSwitchChange('SPI_1', checked)}/>
                                                <span>SPI Escala 1 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_1}
                                                onChange={(e) => handleOpacityChange('SPI_1', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_2} onChange={(checked) => handleSPILayerSwitchChange('SPI_2', checked)}/>
                                                <span>SPI Escala 2 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_2}
                                                onChange={(e) => handleOpacityChange('SPI_2', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_3} onChange={(checked) => handleSPILayerSwitchChange('SPI_3', checked)}/>
                                                <span>SPI Escala 3 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_3}
                                                onChange={(e) => handleOpacityChange('SPI_3', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_6} onChange={(checked) => handleSPILayerSwitchChange('SPI_6', checked)}/>
                                                <span>SPI Escala 6 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_6}
                                                onChange={(e) => handleOpacityChange('SPI_6', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_9} onChange={(checked) => handleSPILayerSwitchChange('SPI_9', checked)}/>
                                                <span>SPI Escala 9 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_9}
                                                onChange={(e) => handleOpacityChange('SPI_9', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_12} onChange={(checked) => handleSPILayerSwitchChange('SPI_12', checked)}/>
                                                <span>SPI Escala 12 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_12}
                                                onChange={(e) => handleOpacityChange('SPI_12', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_24} onChange={(checked) => handleSPILayerSwitchChange('SPI_24', checked)}/>
                                                <span>SPI Escala 24 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_24}
                                                onChange={(e) => handleOpacityChange('SPI_24', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_36} onChange={(checked) => handleSPILayerSwitchChange('SPI_36', checked)}/>
                                                <span>SPI Escala 36 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_36}
                                                onChange={(e) => handleOpacityChange('SPI_36', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_48} onChange={(checked) => handleSPILayerSwitchChange('SPI_48', checked)}/>
                                                <span>SPI Escala 48 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_48}
                                                onChange={(e) => handleOpacityChange('SPI_48', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_60} onChange={(checked) => handleSPILayerSwitchChange('SPI_60', checked)}/>
                                                <span>SPI Escala 60 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_60}
                                                onChange={(e) => handleOpacityChange('SPI_60', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="SPIliSwitchText">
                                                <Switch checked={SPIlayersSwitches.SPI_72} onChange={(checked) => handleSPILayerSwitchChange('SPI_72', checked)}/>
                                                <span>SPI Escala 72 [Mensual]</span>
                                            </div>
                                            <div className="SPIliRange">
                                                <div className="SPIminValue"><span>0</span></div>
                                                <input type="range"
                                                className="inputRange"
                                                min="0"  
                                                max="1"
                                                step="0.1"
                                                value={layerOpacity.SPI_72}
                                                onChange={(e) => handleOpacityChange('SPI_72', parseFloat(e.target.value))}/>
                                                <div className="SPImaxValue"><span>1</span></div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        <li>
                            <button className='bContent'>
                                <FontAwesomeIcon className="infoIcon" icon={faCircleInfo} />
                            </button>
                        </li>
                        <li>
                            <button className='bContent' onClick={handleDownloadClick}>
                                {isDownloading ? (
                                    <span>{downloadProgress}%</span> // Muestra el progreso de la descarga
                                ) : (
                                    <FontAwesomeIcon className="downloadIcon" icon={faDownload} /> // Muestra el ícono de descarga cuando no hay descarga en proceso
                                )}
                            </button>  
                        </li>
                    </ul>
                </div>
            )}
            {isModalVisible && ( 
                    <div className="modal"
                        ref={modalRef}
                        {...bindModal()} 
                        style={{
                            left: modalPosition.x,
                            top: modalPosition.y,
                        }}>
                        <div className="modalNavBar">
                            <div></div>
                            <h2 className="modalNavarTitle">Información</h2>
                            <FontAwesomeIcon className="modalCloseIcon" icon={faXmark} onClick={closeModal} />
                        </div>
                        <div className="modalCoordinates">
                            <div className="coordinatesInfo">
                                <span className='coordinatesTitle'>Coordenadas: </span>
                                {!isCopied && (
                                    <FontAwesomeIcon className='copyIcon' icon={faCopy} onClick={handleCopyCoordinates} />
                                )}
                                {isCopied && (
                                    <FontAwesomeIcon className='okIcon' icon={faCheck} />
                                )}
                            </div>
                            <div className="coordinatesResult">
                                <span className='latResult'>Latitud: {coordinatesResult.lat.toFixed(3)} - </span>
                                <span className='lngResult'> Longitud: {coordinatesResult.lng.toFixed(3)}</span>
                            </div>
                        </div>
                        <div className="modalResults">
                            <ul>
                                {coordinatesResult.lat && coordinatesResult.lng && (
                                    <>
                                    {PTMlayerSwitch.PTM && (PTMResult !== null || notFoundPTMResults) && (
                                        <li>
                                            <span>PTM [mm]: </span>
                                            {PTMResult !== null ? (
                                                `${PTMResult.toFixed(1)}`
                                            ) : (
                                                notFoundPTMResults
                                            )}
                                        </li>
                                    )}
                                    {Object.keys(SPIResults).map((key) => (
                                        SPIlayersSwitches[key] && (SPIResults[key] !== null || notFoundSPIResults[key]) && (
                                            <li key={key}>
                                                <span>{`SPI Escala ${key.replace('SPI_', '')}: `}</span>
                                                {SPIResults[key] !== null ? (
                                                    `${SPIResults[key].toFixed(1)}`
                                                ) : (
                                                    notFoundSPIResults[key]
                                                )}
                                            </li>
                                        )
                                    ))}
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
            )}
        </div>
    )
};

export default MapRasterLayers;

