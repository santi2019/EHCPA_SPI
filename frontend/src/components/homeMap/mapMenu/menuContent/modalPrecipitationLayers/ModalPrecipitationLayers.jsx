import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Switch } from 'antd';
import "./modalprecipitationlayers.css";

/*******************************************************************************************************************************************************/

/**
 * Componente ModalPrecipitation: Modal que permite controlar tanto la visualizacion como el manejo de opacidad en el mapa de las capas de SPI de todas 
 * las escalas.
 * Su estructura es la siguiente:
 * - spiLayersContainer: Contenedor general que en un principio no es visible dado que su visibilidad inicial esta desactivada, definido en su estilo,
 *   pero si el estado "isPrecipitationOpen" es "true", añade dinámicamente la clase "visible" al contenedor, activando la visibilidad en su estilo, y 
 *   de esta manera se renderiza el modal. 
 * - precipitationNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de cierre.
 * - precipitationLayersContent: Contenedor que se utiliza para estructurar contenido del modal.
 *   - precipitationLayersItems: Lista de capas. Para evitar duplicar codigo utilizamos metodo "map()" para iterar sobre el arreglo "layers" y generar los 
 *     elementos "li" de forma dinamica. En cada iteración, se accede a los valores necesarios como "layersSwitches" y "layerOpacity" para controlar 
 *     el estado y las acciones.
 * - Por ultimo, se exporta "ModalPrecipitation" como componente.
*/

const ModalPrecipitation = ({
    isPrecipitationOpen,
    setIsMouseOverComponent,
    closePrecipitationContainer,
    isPrecipitationNavbarSwitchChecked,
    handlePrecipitationNavbarSwitchChange,
    PrecipitationlayersSwitches,
    handlePrecipitationLayerSwitchChange,
    layerOpacity,
    handleOpacityChange,
}) => {

  /** Estados y variables:
    * - layers: Arreglo que contiene el nombre de cada capa y su identificador.
  */

  const layers = [
    { name: 'Precip. Total Mensual [mm]', key: 'PTM' },
    { name: 'PMP 24h [mm]', key: 'PMP_24h' },
    { name: 'PMP 1 [mm]', key: 'PMP_1' },
    { name: 'PMD 2 [mm]', key: 'PMD_2' },
    { name: 'PMD 5 [mm]', key: 'PMD_5' },
    { name: 'PMD 10 [mm]', key: 'PMD_10' },
    { name: 'PMD 25 [mm]', key: 'PMD_25' },
    { name: 'PMD 50 [mm]', key: 'PMD_50' },
    { name: 'PMD 100 [mm]', key: 'PMD_100' }
  ];

  /*******************************************************************************************************************************************************/

  /**
   * Funcion handleClosePresipitation: Sirve para cerrar el submenú o modal de SPI.
   * 1. "setIsMouseOverComponent" se establece en "false" para indicar que el mouse ya no está sobre el componente. 
   * 2. Efecuta la funcion "closePrecipitationContainer" para cerrar el modal de SPI si estaba abierto, al hacer click en el icono de "X" del mismo.
  */

  const handleClosePresipitation = () => {
    setIsMouseOverComponent(true)
    closePrecipitationContainer(); 
  };

  /*******************************************************************************************************************************************************/
      
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
                    <li key={layer.key} data-layer={layer.key}>
                        <div className="precipitationSwitchText">
                            <Switch checked={PrecipitationlayersSwitches[layer.key]} onChange={(checked) => handlePrecipitationLayerSwitchChange(layer.key, checked)}/>
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