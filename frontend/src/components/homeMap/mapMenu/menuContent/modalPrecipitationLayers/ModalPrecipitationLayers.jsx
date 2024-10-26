import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Switch } from 'antd';
import "./modalprecipitationlayers.css";


const ModalPrecipitation = ({
    isPrecipitationOpen,
    setIsMouseOverComponent,
    closePrecipitationContainer,
    isPrecipitationNavbarSwitchChecked,
    handlePrecipitationNavbarSwitchChange,
    PTMlayerSwitch,
    handlePTMLayerSwitchChange,
    layerOpacity,
    handleOpacityChange,
}) => {

  const layers = [
    { name: 'Precip. Total Mensual [mm]', key: 'PTM' }
  ];


    const handleClosePresipitation = () => {
        setIsMouseOverComponent(true)
        closePrecipitationContainer(); 
    };
      
  return (
    <div className={`precipitationLayerContainer ${isPrecipitationOpen ? 'visible' : 'hidden'}`}
    onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
        <div className="precipitationNavbar">
            <Switch checked={isPrecipitationNavbarSwitchChecked} onChange={handlePrecipitationNavbarSwitchChange} />
            <h2 className="precipitationNavbarTitle">Precipitación</h2>
            <FontAwesomeIcon className="precipitationCloseIcon" icon={faXmark} onClick={handleClosePresipitation} />
        </div>
        <div className="precipitationLayersContent">
            <ul className="precipitationLayersItems">
                {layers.map(layer => (
                    <li key={layer.key}>
                        <div className="precipitationSwitchText">
                            <Switch checked={PTMlayerSwitch[layer.key]} onChange={(checked) => handlePTMLayerSwitchChange(layer.key, checked)}/>
                            <span className="precipitationLayerName">{layer.name}</span>
                        </div>
                        <div className="precipitationLayersRange">
                            <input
                                type="range"
                                className="inputRange"
                                min="0"
                                max="1"
                                step="0.1"
                                value={layerOpacity[layer.key]}
                                style={{
                                  background: `linear-gradient(to right, #1677ff ${layerOpacity[layer.key] * 100}%, #cccccc ${layerOpacity[layer.key] * 100}%)`
                                }}
                                onChange={(e) => handleOpacityChange(layer.key, parseFloat(e.target.value))}
                              />
                            <div className="precipitationOpacityValue">
                                <span>{Math.round(layerOpacity[layer.key] * 100)}%</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default ModalPrecipitation;