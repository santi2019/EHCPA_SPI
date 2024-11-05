import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Switch } from 'antd';
import "./modalspilayers.css";

/*******************************************************************************************************************************************************/

/**
 * Componente ModalSPILayers: Modal que permite controlar tanto la visualizacion como el manejo de opacidad en el mapa de las capas de SPI de todas las 
 * escalas.
 * Su estructura es la siguiente:
 * - spiLayersContainer: Contenedor general que en un principio no es visible dado que su visibilidad inicial esta desactivada, definido en su estilo,
 *   pero si el estado "isSPIOpen" es "true", añade dinámicamente la clase "visible" al contenedor, activando la visibilidad en su estilo, y de esta
 *   manera se renderiza el modal. 
 * - spiNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de cierre.
 * - spiLayersContent: Contenedor que se utiliza para estructurar contenido del modal.
 *   - spiLayersItems: Lista de capas. Para evitar duplicar codigo utilizamos metodo "map()" para iterar sobre el arreglo "layers" y generar los 
 *     elementos "li" de forma dinamica. En cada iteración, se accede a los valores necesarios como "layersSwitches" y "layerOpacity" para controlar 
 *     el estado y las acciones.
 * - Por ultimo, se exporta "ModalSPILayers" como componente.
*/

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

  /** Estados y variables:
    * - layers: Arreglo que contiene el nombre de cada capa y su identificador.
  */

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

  /*******************************************************************************************************************************************************/

  /**
   * Funcion handleCloseSPI: Sirve para cerrar el submenú o modal de SPI.
   * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
   * 2. Efecuta la funcion "closeSPIContainer" para cerrar el modal de SPI si estaba abierto, al hacer click en el icono de "X" del mismo.
  */
 
  const handleCloseSPI = () => {
    setIsMouseOverComponent(false)
    closeSPIContainer(); 
  };

  /*******************************************************************************************************************************************************/

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
            <li key={layer.key} data-layer={layer.key}>
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
