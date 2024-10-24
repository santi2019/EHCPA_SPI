import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Switch } from 'antd';
import "./modalspilayers.css";


const ModalSPILayers = ({
  isSPIOpen,
  setIsMouseOverComponent,
  closeSPIContainer,
  isSPINavbarSwitchChecked,
  handleSPINavbarSwitchChange,
  SPIlayersSwitches,
  handleSPILayerSwitchChange,
  layerOpacity,
  handleOpacityChange
}) => {


    const layers = [
        { name: 'SPI Escala 1 [Mensual]', key: 'SPI_1' },
        { name: 'SPI Escala 2 [Mensual]', key: 'SPI_2' },
        { name: 'SPI Escala 3 [Mensual]', key: 'SPI_3' },
        { name: 'SPI Escala 6 [Mensual]', key: 'SPI_6' },
        { name: 'SPI Escala 9 [Mensual]', key: 'SPI_9' },
        { name: 'SPI Escala 12 [Mensual]', key: 'SPI_12' },
        { name: 'SPI Escala 24 [Mensual]', key: 'SPI_24' },
        { name: 'SPI Escala 36 [Mensual]', key: 'SPI_36' },
        { name: 'SPI Escala 48 [Mensual]', key: 'SPI_48' },
        { name: 'SPI Escala 60 [Mensual]', key: 'SPI_60' },
        { name: 'SPI Escala 72 [Mensual]', key: 'SPI_72' }
    ];

    const handleCloseSPI = () => {
      setIsMouseOverComponent(false)
      closeSPIContainer(); 
  };

  return (
    <div 
    className={`spiLayersContainer ${isSPIOpen ? 'visible' : 'hidden'}`}
    onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
      <div className="spiNavbar" >
        <Switch checked={isSPINavbarSwitchChecked} onChange={handleSPINavbarSwitchChange} />
        <h2 className="spiNavbarTitle">Índice de Precipitación Estandarizado</h2>
        <FontAwesomeIcon className="spiCloseIcon" icon={faXmark} onClick={handleCloseSPI} />
      </div>
      <div className="spiLayersContent">
        <ul className="spiLayersItems">
          {layers.map(layer => (
            <li key={layer.key}>
              <div className="spiSwitchText">
                <Switch
                  checked={SPIlayersSwitches[layer.key]}
                  onChange={(checked) => handleSPILayerSwitchChange(layer.key, checked)}
                />
                <span className="spiLayerName">{layer.name}</span>
              </div>
              <div className="spiLayersRange">
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
                <div className="spiOpacityValue">
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


export default ModalSPILayers;
