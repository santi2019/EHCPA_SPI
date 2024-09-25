import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faXmark} from "@fortawesome/free-solid-svg-icons";
import {Switch} from "antd";
import "./mapvectoriallayers.css";


const MapVectorialLayers = ({setIsMouseOverComponent}) => {
    const elementRef = useRef(null);
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
    const map = useMap();
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



    const handleOpacityChange = (layer, value) => {
        setLayerOpacity((prevState) => ({
            ...prevState,
            [layer]: value
        }));
    };

    
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


    const handleLayerSwitchChange = (layer, checked) => {
        setLayersSwitches((prevState) => ({
            ...prevState,
            [layer]: checked
        }));
    };


    const handleVisibility = () => {
        setIsVisible(!isVisible);
    };


    const closeLayersContainer = () => {
        setIsVisible(false);
        setIsMouseOverComponent(false)
    };


    return(
        <div ref={elementRef}  onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className="bContainer">
                <button className='bLayers' onClick={handleVisibility}>
                    <FontAwesomeIcon className="layersIcon" icon={faLayerGroup} />
                </button>  
            </div>
            {isVisible && (
                <div className="layersContainer">
                    <div className="layersNavbar">
                        <Switch checked={isNavbarSwitchChecked} onChange={handleNavbarSwitchChange}/>
                        <h2 className="layersNavarTitle">Capas</h2>
                        <FontAwesomeIcon className="closeIcon" icon={faXmark} onClick={closeLayersContainer}/>
                    </div>
                    <div className="layersContent">
                        <ul className="layersItems">
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.salsipuedes} onChange={(checked) => handleLayerSwitchChange('salsipuedes', checked)}/>
                                    <span>Cuenca Salsipuedes</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange"
                                    min="0"  
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.salsipuedes}
                                    onChange={(e) => handleOpacityChange('salsipuedes', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.sanAntonio} onChange={(checked) => handleLayerSwitchChange('sanAntonio', checked)}/>
                                    <span>Cuenca San Antonio</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange" 
                                    min="0"  
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.sanAntonio}
                                    onChange={(e) => handleOpacityChange('sanAntonio', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.cosquin} onChange={(checked) => handleLayerSwitchChange('cosquin', checked)}/>
                                    <span>Cuenca Cosquín</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange"
                                    min="0"  
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.cosquin}
                                    onChange={(e) => handleOpacityChange('cosquin', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.sanRoque} onChange={(checked) => handleLayerSwitchChange('sanRoque', checked)}/>
                                    <span>Cuenca San Roque</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange"
                                    min="0"  
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.sanRoque}
                                    onChange={(e) => handleOpacityChange('sanRoque', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.losMolinos} onChange={(checked) => handleLayerSwitchChange('losMolinos', checked)}/>
                                    <span>Cuenca Los Molinos</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange"
                                    min="0"  
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.losMolinos}
                                    onChange={(e) => handleOpacityChange('losMolinos', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.embalse} onChange={(checked) => handleLayerSwitchChange('embalse', checked)}/>
                                    <span>Cuenca Embalse</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange" 
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.embalse}
                                    onChange={(e) => handleOpacityChange('embalse', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                            <li>
                                <div className="liSwitchText">
                                    <Switch checked={layersSwitches.provincias} onChange={(checked) => handleLayerSwitchChange('provincias', checked)}/>
                                    <span>Limites Provinciales</span>
                                </div>
                                <div className="liRange">
                                    <div className="minValue"><span>0</span></div>
                                    <input type="range"
                                    className="inputRange" 
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity.provincias}
                                    onChange={(e) => handleOpacityChange('provincias', parseFloat(e.target.value))}/>
                                    <div className="maxValue"><span>1</span></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>        
            )}  
        </div>
    );
};

export default MapVectorialLayers;


