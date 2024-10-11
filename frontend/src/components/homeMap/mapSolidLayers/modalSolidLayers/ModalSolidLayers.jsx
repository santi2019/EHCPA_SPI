import React from 'react';
import { Switch } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./modalsolidlayers.css";


/**
 * Componente ModalSolidLayers: Modal que constituye el menu que permite el control de la visualizacion
 * en el mapa de las capas de las provincias de Argentina, y las cuencas de Salsipuedes, San Antonio, 
 * Cosquin, San Roque, Los Molinos y Embalse. Su visualizacion depende del estado del boton del 
 * componente "MapSolidLayers", por lo que si su valor es "true", el modal se muestra, caso contrario
 * retorna "null" para no renderizar nada.
 * Su estructura es la siguiente:
 * - modalSolidLayersContainer: Contenedor general que en un principio no es visible dado que su opacidad
 *   inicial es 0, definido en su estilo, pero si el estado "isVisible" es "true", añade dinámicamente la 
 *   clase "visible" a "modalSolidLayersContainer", cambiando la opacidad a 1 en su estilo, y de esta manera
 *   se permite la visualizacion. 
 *   "isVisible" es "true".
 * - solidLayersNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal.
 *      - solidLayersNavarTitle: Titulo del navbar del modal.
 *      - closeIcon: Icono de "x" para cerrar el modal.
 * - solidLayersContent: Contenedor que se utiliza para estructurar las capas del modal.
 *      - solidLayersItems: Lista de capas. Para evitar duplicar codigo utilizamos metodo "map()"" para 
 *        iterar sobre el arreglo "layers" y generar los elementos <li> de forma dinamica. En cada iteración, 
 *        se accede a los valores necesarios como "layersSwitches" y "layerOpacity" para controlar el estado 
 *        y las acciones.
 *      - solidLayersSwitchText: Contenedor que se utiliza para estructurar el switch y el texto que
 *        identifica a cada capa.
 * - Por ultimo, se exporta "ModalSolidLayers" como componente.
*/
const ModalSolidLayers = ({
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
    


    return  (
        <div className={`modalSolidLayersContainer ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="solidLayersNavbar">
                <Switch checked={isNavbarSwitchChecked} onChange={handleNavbarSwitchChange}/>
                <h2 className="solidLayersNavarTitle">Capas Sólidas</h2>
                <FontAwesomeIcon className="closeIcon" icon={faXmark} onClick={closeLayersContainer}/>
            </div>
            <div className="solidLayersContent">
                <ul className="solidLayersItems">
                    {layers.map(layer => (
                        <li key={layer.key}>
                            <div className="solidLayersSwitchText">
                                <Switch checked={layersSwitches[layer.key]} onChange={(checked) => handleLayerSwitchChange(layer.key, checked)}/>
                                <span className="solidLayerName">{layer.name}</span>
                            </div>
                            <div className="solidLayersRange">
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
                                <div className="maxValue">
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


export default ModalSolidLayers;