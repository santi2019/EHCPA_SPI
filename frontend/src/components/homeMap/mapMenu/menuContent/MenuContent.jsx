import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faCircleInfo, faDownload } from "@fortawesome/free-solid-svg-icons";
import "./menucontent.css";
import ModalPrecipitation from './modalPrecipitationLayers/ModalPrecipitationLayers';
import ModalSPILayers from './modalSPILayers/ModalSPILayers';

/*******************************************************************************************************************************************************/

/**
 * Componente MenuContent: Renderiza el menu de opciones cuando se hace click en el boton del componente MapMenu.
 * Su estructura es la siguiente: 
 * - menuContent: Contenedor general.
 * - menuItems: Contenedor que estructura cada uno de los botones del menu.
 *   - Boton "rainIcon": permite abrir el modal de capas de precipitacion.
 *   - Boton "SPI": permite abrir el modal de capas de SPI.
 *   - Boton "infoIcon": permite abrir el modal informativo del mapa.
 *   - Boton "downloadIcon": permite efectuar la descarga de archivos.
 * - ModalPrecipitation: Componenete que renderiza el modal de capas de precipitacion.
 * - ModalSPILayers: Componente que renderiza el modal de capas de SPI.
 * - Por ultimo, se exporta "MenuContent" como componente.
*/

const MenuContent = ({
    isMenuOpen,
    setIsMouseOverComponent,
    isPrecipitationOpen,
    handlePrecipitationOpen,
    isSPIOpen,
    handleSPIOpen,
    isDownloading,
    downloadProgress,
    handleDownloadClick,
    closePrecipitationContainer,
    closeSPIContainer,
    handlePrecipitationNavbarSwitchChange,
    handlePTMLayerSwitchChange,
    handleSPINavbarSwitchChange,
    handleSPILayerSwitchChange,
    layerOpacity,
    SPIlayersSwitches,
    PTMlayerSwitch,
    isPrecipitationNavbarSwitchChecked,
    isSPINavbarSwitchChecked,
    handleOpacityChange,
    handleOpenInfoMap,
  }) => {

    /** Estados y variables:
     * - shouldAnimate: Estado que se utiliza para indicar si se debe animar la apertura del menu. Mediante "setShouldAnimate" cambiamos el valor de la
     *   bandera.
    */

    const [shouldAnimate, setShouldAnimate] = useState(false);

    /*******************************************************************************************************************************************************/

    /**
     * El siguiente "useEffect" se utiliza para gestionar la animación de apertura del menú. 
     * 1. Escucha los cambios en el estado "isMenuOpen" y controla el estado "shouldAnimate" para indicar si el menú debe tener animación al abrirse.
     *    - Si se abre el menu, actualizando el estado de "isMenuOpen" a "true", mediante "setShouldAnimate" se establece en "true" al estado "shouldAnimate", 
     *      para activar el efecto de animacion, mediante la asignacion de la clase CSS "appear" en los elementos "menuItemsli", de forma tal que se observe
     *      un efecto de escalera.
     *   - Si se cierra el menu, actualizando el estado de "isMenuOpen" a "false", mediante "setShouldAnimate" se establece en "false" al estado "shouldAnimate", 
     *      para indicar que no se produce ningun efecto de animacion y no se aplique la clase CSS "appear" en los elementos "menuItemsli".
     * 2. Al incluir "isMenuOpen" en el arreglo de dependencias, este "useEffect" se ejecuta cada vez que el estado "isMenuOpen" cambia, manteniendo la 
     *    sincronización entre la apertura/cierre del menú y la activación de la animación.
    */

    useEffect(() => {
        if (isMenuOpen) {
            setShouldAnimate(true);
        } else {
            setShouldAnimate(false);
        }
    }, [isMenuOpen]);

    /*******************************************************************************************************************************************************/

    /**
     * - Si se cierra el menu mediante el boton, el estado "isMenuOpen" es "false", y por ende no se renderiza nada.
     * - Caso contrario, se renderiza el menu.
    */
   
    if (!isMenuOpen) return null;

    /*******************************************************************************************************************************************************/
  
    return (
        <div className="menuContent" onMouseEnter={() => setIsMouseOverComponent(true)} onMouseLeave={() => setIsMouseOverComponent(false)}>
            <ul className="menuItems" >
                <li className={`menuItemsli ${shouldAnimate ? 'appear' : ''}`}>
                    <button className="buttonContent" onClick={handlePrecipitationOpen} >
                        <FontAwesomeIcon className="rainIcon" icon={faCloudRain} />
                    </button>
                </li>
                <li className={`menuItemsli ${shouldAnimate ? 'appear' : ''}`}>
                    <button className='buttonContent' onClick={handleSPIOpen} >
                        <span className="spiButtonContent">SPI</span>
                    </button> 
                </li>
                <li className={`menuItemsli ${shouldAnimate ? 'appear' : ''}`}>
                    <button className='buttonContent' onClick={handleOpenInfoMap}>
                        <FontAwesomeIcon className="infoIcon" icon={faCircleInfo} />
                    </button>
                </li>
                <li className={`menuItemsli ${shouldAnimate ? 'appear' : ''}`}>
                    <button className='buttonContent' onClick={handleDownloadClick}>
                        {isDownloading ? (
                            <span className="downloadProgressButtonContent">{downloadProgress}%</span> 
                        ) : (
                            <FontAwesomeIcon className="downloadIcon" icon={faDownload} /> 
                        )}
                    </button>  
                </li>
            </ul>
            <ModalPrecipitation
                    isPrecipitationOpen={isPrecipitationOpen}
                    setIsMouseOverComponent={setIsMouseOverComponent}
                    closePrecipitationContainer={closePrecipitationContainer}
                    isPrecipitationNavbarSwitchChecked={isPrecipitationNavbarSwitchChecked}
                    handlePrecipitationNavbarSwitchChange={handlePrecipitationNavbarSwitchChange}
                    PTMlayerSwitch={PTMlayerSwitch}
                    handlePTMLayerSwitchChange={handlePTMLayerSwitchChange}
                    layerOpacity={layerOpacity}
                    handleOpacityChange={handleOpacityChange}
            />
            <ModalSPILayers
                    isSPIOpen={isSPIOpen}
                    setIsMouseOverComponent={setIsMouseOverComponent}
                    closeSPIContainer={closeSPIContainer}
                    isSPINavbarSwitchChecked={isSPINavbarSwitchChecked}
                    handleSPINavbarSwitchChange={handleSPINavbarSwitchChange}
                    SPIlayersSwitches={SPIlayersSwitches}
                    handleSPILayerSwitchChange={handleSPILayerSwitchChange}
                    layerOpacity={layerOpacity}
                    handleOpacityChange={handleOpacityChange}
            />
        </div>
        );
    };
  
  export default MenuContent;