import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faCircleInfo, faDownload } from "@fortawesome/free-solid-svg-icons";
import "./menucontent.css";
import ModalPrecipitation from './modalPrecipitationLayers/ModalPrecipitationLayers';
import ModalSPILayers from './modalSPILayers/ModalSPILayers';

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

    const [shouldAnimate, setShouldAnimate] = useState(false);


    useEffect(() => {
        if (isMenuOpen) {
            setShouldAnimate(true);
        } else {
            setShouldAnimate(false);
        }
    }, [isMenuOpen]);

    if (!isMenuOpen) return null;
  
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