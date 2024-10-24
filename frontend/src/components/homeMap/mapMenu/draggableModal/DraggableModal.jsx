import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from 'react-tooltip'
import useNoScroll from "../../../../hooks/useNoScroll"
import "./draggablemodal.css";


const DraggableModal = ({
  isDraggModalVisible,
  setIsMouseOverComponent,
  modalPosition,
  bindModal,
  modalRef,
  closeModal,
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
   
    const valuesContainerRef = useNoScroll([PTMResult, SPIResults, notFoundPTMResults, notFoundSPIResults]); 


    const isValuesContainerEmpty = !(
        PTMlayerSwitch.PTM && (PTMResult !== null || notFoundPTMResults) ||
        Object.keys(SPIResults).some(key => SPIlayersSwitches[key] && (SPIResults[key] !== null || notFoundSPIResults[key]))
    );
  

  if (!isDraggModalVisible) return null;



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
        <div></div>
        <h2 className="draggModalNavbarTitle">Información</h2>
        <FontAwesomeIcon className="draggModalCloseIcon" icon={faXmark} onClick={closeModal} />
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