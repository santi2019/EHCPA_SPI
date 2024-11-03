import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from 'react-tooltip'
import useNoScroll from "../../../../hooks/useNoScroll"
import "./draggablemodal.css";

/*******************************************************************************************************************************************************/

/**
 * Componente DraggableModal: Modal que muestra las coordenadas, y valores de las capas activas, ya sea de PTM o SPI. EL mismo se renderiza cuando se
 * hace click en un punto del mapa y puede ser arrastrado por todo el sitio web (no supera el navbar). 
 * Su estructura es la siguiente:
 * - draggModalContainer: Contenedor general.
 *    - "ref={modalRef}": Se asocia el "modalRef" para controlar la posición y referencias del modal en el DOM.
 *    - "{...bindModal()}": Permite arrastrar el modal usando las propiedades de "bindModal".
 *    - "style": Aplica las coordenadas "left" y "top" a partir de "modalPosition.x" y "modalPosition.y" para situar el modal en la posición inicial 
 *      deseada en la pantalla.
 * - draggModalNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de cierre.
 * - draggModalCoordinatesContainer: Contenedor que se utiliza para estructurar los valores de las coordenadas y el boton para copiar los datos.
 * - draggModalValuesContainer: Contenedor que se utiliza para estructurar los valores de PTM y SPI.
 *   - draggModalValuesItems: Lista de valores.
 * - Por ultimo, se exporta "DraggableModal" como componente.
*/

const DraggableModal = ({
  isDraggModalVisible,
  setIsMouseOverComponent,
  modalPosition,
  bindModal,
  modalRef,
  closeDraggModal,
  coordinatesResult,
  isCopied,
  handleCopyValues,
  PTMResult,
  notFoundPTMResults,
  PTMlayerSwitch,
  SPIResults,
  SPIlayersSwitches,
  notFoundSPIResults
}) => {

    /** Estados y variables:
     * - valuesContainerRef: Se utiliza para crear una referencia al contenedor que muestra los valores de PTM y SPI para quitar el borde derecho de los
     *   elementos "li" en caso de que el scroll-bar no este presente.
    */
   
    const valuesContainerRef = useNoScroll([PTMResult, SPIResults, notFoundPTMResults, notFoundSPIResults]); 

    /*******************************************************************************************************************************************************/
    
    /**
     * Funcion isValuesContainerEmpty: Sirve para verificar si el contenedor de valores del modal esta vacío, es decir, si no hay datos disponibles para 
     * mostrar, y devuelve un valor booleano que controlar la clase CSS aplicada al contenedor de las coordenadas que elimina el borde inferior.
     * 1. La primera condición evalúa la capa PTM:
     *    - Si "PTMlayerSwitch" es "true", es decir, la capa PTM está activada, y a su vez, si "PTMResult" no es null o si hay un mensaje de "S/D" en 
     *      "notFoundPTMResults", significa que hay datos o un mensaje de "S/D" para la capa PTM mostrandose en el modal, por lo que la condicion general
     *      sera "true".
     * 2. La segunda condición evalúa las capas SPI:
     *    - Mediante "Object.keys(SPIResults)" obtenemos un arreglo con los nombres de todas las capas SPI. Con ".some(...)" recorremos cada clave de 
     *      SPI, devolviendo "true" si alguna capa cumple las siguientes condiciones:
     *       - Si "SPIlayersSwitches" es "true", es decir, la capa de SPI específica está activada, y a su vez si "SPIResults" de dicha capa no es "null"
     *         o si "notFoundSPIResults" de dicha capa contiene un mensaje de "S/D". Si al menos una capa SPI cumple estas condiciones, por lo que la condicion 
     *         general de la expresión retorna "true".
     * 3. Entonces, la negación al inicio "!" invierte el resultado:
     *    - Si ninguna capa PTM o SPI tiene datos o mensajes de "S/D" (siendo alguno de los casos "false"), "isValuesContainerEmpty" es "true", indicando 
     *      que el contenedor de valores esta vacío y debe aplicarse la clase CSS para ocultar el borde.
     *    - Si hay algún valor o mensaje para mostrar (siendo alguno de los casos "true"), "isValuesContainerEmpty" es "false" indicando que el contenedor 
     *      no esta vacio, permitiendo que el borde del contenedor esté visible.
    */

    const isValuesContainerEmpty = !(
        PTMlayerSwitch.PTM && (PTMResult !== null || notFoundPTMResults) ||
        Object.keys(SPIResults).some(key => SPIlayersSwitches[key] && (SPIResults[key] !== null || notFoundSPIResults[key]))
    );
  
    /*******************************************************************************************************************************************************/

    /**
     * - Si se cierra el modal mediante el icono de "X", el estado "isDraggModalVisible" es "false", y por ende no se renderiza nada.
     * - Caso contrario, se renderiza el modal cuando se hace click en el mapa.
    */

    if (!isDraggModalVisible) return null;

    /*******************************************************************************************************************************************************/

    return (
        <div className="draggModalContainer"
        ref={modalRef}
        {...bindModal()} 
        style={{
            left: modalPosition.x,
            top: modalPosition.y,
        }}
        onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}
        >
            <div className="draggModalNavbar">
                <h2 className="draggModalNavbarTitle">Información</h2>
                <FontAwesomeIcon className="draggModalCloseIcon" icon={faXmark} onClick={closeDraggModal} />
            </div>
            <div className={`draggModalCoordinatesContainer ${isValuesContainerEmpty ? 'no-border' : ''}`}>
                <div className="draggModalCoordinatesTitleCopy">
                    <span className='draggModalCoordinatesTitle'>Coordenadas: </span>
                    {!isCopied && (
                        <FontAwesomeIcon className='draggModalCopyIcon' icon={faCopy} onClick={handleCopyValues}/>
                    )}
                    {isCopied && (
                        <FontAwesomeIcon className='draggModalOkIcon' icon={faCheck} />
                    )}
                    <Tooltip anchorSelect=".draggModalCopyIcon" place="top" opacity={1} className="tooltipCustom">
                        Copiar datos
                    </Tooltip>
                </div>
                <div className="draggModalCoordinatesResult">
                    <span className='draggModallatResult'>Latitud: {coordinatesResult.lat.toFixed(3)} - </span>
                    <span className='draggModallngResult'> Longitud: {coordinatesResult.lng.toFixed(3)}</span>
                </div>
            </div>
            <div  ref={valuesContainerRef} className="draggModalValuesContainer">
                <ul className="draggModalValuesItems">
                    {coordinatesResult.lat && coordinatesResult.lng && (
                        <>
                        {PTMlayerSwitch.PTM && (PTMResult !== null || notFoundPTMResults) && (
                            <li className="lidraggModalValues">
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
                                <li key={key} className="lidraggModalValues">
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
    );
};



export default DraggableModal;