import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCircleInfo, faDownload, faXmark} from "@fortawesome/free-solid-svg-icons";
import {Switch} from "antd";
import "./maprasterlayers.css";
import 'leaflet-geoserver-request';

const MapRasterLayers = ({setIsMouseOverSearch}) => {
    const elementRef = useRef(null);
    const map = useMap();
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
    
            updateLayer();
    
            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
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
    
            updateLayer();
    
            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
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
    };


    const handlePTMLayerSwitchChange = (layer, checked) => {
        setPTMLayerSwitch((prevState) => ({
            ...prevState,
            [layer]: checked
        }));
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
    };


    const handleSPILayerSwitchChange = (layer, checked) => {
        setSPILayersSwitches((prevState) => ({
            ...prevState,
            [layer]: checked
        }));
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
    };

    const closeSPIContainer = () => {
        setIsSPIOpen(false);
    };

    return(
        <div ref={elementRef}>
            <div className="bMenuContainer"  onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
                <button className='menuButton' onClick={handleOpenMenu} >
                    <FontAwesomeIcon className="menuIcon" icon={isMenuOpen ? faXmark : faBars}/>
                </button>  
            </div>
            {isMenuOpen && (
                <div className="menuContent" >
                    <ul className="menuItems">
                        <li className="menuItemsli">
                            <button className='bContent' onClick={handlePTMOpen} onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
                                <span>PTM</span>
                            </button>
                        </li>
                        {isPTMOpen && (
                            <div className="PTMlayerContainer" onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
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
                            <button className='bContent' onClick={handleSPIOpen} onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
                                <span>SPI</span>
                            </button> 
                        </li>
                        {isSPIOpen && (
                            <div className="SPIlayersContainer" onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
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
                            <button className='bContent'  onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
                                <FontAwesomeIcon className="infoIcon" icon={faCircleInfo} />
                            </button>
                        </li>
                        <li>
                            <button className='bContent'  onMouseEnter={() => setIsMouseOverSearch(true)} onMouseLeave={() => setIsMouseOverSearch(false)}>
                                <FontAwesomeIcon className="downloadIcon" icon={faDownload} />
                            </button>  
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
};

export default MapRasterLayers;

