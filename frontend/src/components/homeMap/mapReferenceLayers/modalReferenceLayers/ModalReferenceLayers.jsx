import React from 'react';
import { Switch } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./modalreferencelayers.css";

/*******************************************************************************************************************************************************/

/**
 * Componente ModalReferenceLayers: Modal que permite controlar tanto la visualizacion como el manejo de opacidad en el mapa de las capas de las 
 * provincias de Argentina, y las cuencas de Salsipuedes, San Antonio, Cosquin, San Roque, Los Molinos y Embalse.
 * Su estructura es la siguiente:
 * - referenceLayersContainer: Contenedor general que en un principio no es visible dado que su visibilidad inicial esta desactivada, definido en su 
 *   estilo, pero si el estado "isVisible" es "true", añade dinámicamente la clase "visible" al contenedor, activando la visibilidad en su estilo, y de 
 *   esta manera se renderiza el modal. 
 * - referenceLayersNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de cierre.
 * - referenceLayersContent: Contenedor que se utiliza para estructurar contenido del modal.
 *   - referenceLayersItems: Lista de capas. Para evitar duplicar codigo utilizamos metodo "map()" para iterar sobre el arreglo "layers" y generar los 
 *     elementos "li" de forma dinamica. En cada iteración, se accede a los valores necesarios como "layersSwitches" y "layerOpacity" para controlar el 
 *     estado y las acciones.
 * - Por ultimo, se exporta "ModalReferenceLayers" como componente.
*/

const ModalReferenceLayers = ({
    isVisible, 
    closeLayersContainer, 
    isNavbarSwitchChecked, 
    handleNavbarSwitchChange, 
    layersSwitches, 
    handleLayerSwitchChange, 
    layerOpacity, 
    handleOpacityChange 
}) => {


    /** Estados y variables:
     * - layers: Arreglo que contiene el nombre de cada capa y su identificador.
    */
   
    const layers = [
        { name: 'Cuenca Salsipuedes', key: 'salsipuedes' },
        { name: 'Cuenca San Antonio', key: 'sanAntonio' },
        { name: 'Cuenca Cosquín', key: 'cosquin' },
        { name: 'Cuenca San Roque', key: 'sanRoque' },
        { name: 'Cuenca Los Molinos', key: 'losMolinos' },
        { name: 'Cuenca Embalse', key: 'embalse' },
        { name: 'Límites Provinciales', key: 'provincias' }
    ];

    /*******************************************************************************************************************************************************/

    return  (
        <div className={`referenceLayersContainer ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="referenceLayersNavbar">
                <Switch checked={isNavbarSwitchChecked} onChange={handleNavbarSwitchChange}/>
                <h2 className="referenceLayersNavbarTitle">Capas de Referencia</h2>
                <FontAwesomeIcon className="referenceCloseIcon" icon={faXmark} onClick={closeLayersContainer}/>
            </div>
            <div className="referenceLayersContent">
                <ul className="referenceLayersItems">
                    {layers.map(layer => (
                        <li key={layer.key}>
                            <div className="referenceLayersSwitchText">
                                <Switch checked={layersSwitches[layer.key]} onChange={(checked) => handleLayerSwitchChange(layer.key, checked)}/>
                                <span className="referenceLayerName">{layer.name}</span>
                            </div>
                            <div className="referenceLayersRange">
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
                                <div className="referenceLayerOpacityValue">
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


export default ModalReferenceLayers;