import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faDownload} from "@fortawesome/free-solid-svg-icons";
import PTMLeyend from "../../../../../assets/images/PTM_Leyend.png";
import SPILeyend from "../../../../../assets/images/SPI_Leyend.png";
import "./infomap.css";

/*******************************************************************************************************************************************************/

/**
 * Componente InfoMap: Permite visualizar el modal informativo del mapa. 
 * Su estructura es la siguiente:
 * - infoMapContainer: Contenedor general el cual produce un efecto de oscurecimiento del fondo.
 * - itemsInfoSearchModal: Contenedor que se utiliza para estructurar todo el contenido del modal. Si el estado de "closingInfoMap" es "true", se agrega 
 *   dinamicamente la clase CSS "closingInfoMap", para la animación de cierre, es decir, un efecto de reduccion. Y si "closingInfoMap" es "false", la 
 *   clase "closingInfoMap" no se aplica, ya que significa que el modal se abrio, y se visualiza un efecto de expancion.
 * - infoSearchModalNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de "X" de cierre. 
 * - infoSearchModalContent: Contenedor que abarca todos los textos informativos del modal.
 * - Por ultimo, se exporta "InfoMap" como componente.
*/

const InfoMap = ({ 
    handleCloseInfoMap,
    setIsMouseOverComponent,
    todayDay,
    todayMonth,
    todayYear,
    lastBandDay,
    lastBandMonth,
    lastBandYear,
    calibrationDate,
}) => { 
   
    /** Estados y variables:
     * - closingInfoMap: Estado que indica si el modal esta en proceso de cerrarse, y se utiliza para activar la animación de cierre. Inicialmente es "false" 
     *   y mediante "setClosingInfoMap" actualizamos el estado del mismo.
     */

    const [closingInfoMap, setClosingInfoMap] = useState(false);
  
   /*******************************************************************************************************************************************************/

   /** Funcion handleCloseEffect: Sirve para aplicar la animacion de cierre del modal.
     *  1. Se setea el estado "closingInfoMap" como "true" para indicar que el modal esta en proceso de cerrarse. Y esto ayuda a indicar que se aplicara la 
     *     clase CSS "closingInfoMap" que activa la animacion de cierre.
     *  2. Al setear "false" en setIsMouseOverComponent() indicamos que el mouse ya no está sobre ese componente, en este caso el modal.
     *  3. Mediante "setTimeout" asignamos un delay para esperar 200 milisegundos, tiempo que coincide con la duración de la animacion de cierre, antes de 
     *     ejecutar la funcion "handleCloseInfoMap", que efectivamente cierra el modal.
    */ 

    const handleCloseEffect = () => {
        setClosingInfoMap(true);
        setIsMouseOverComponent(true)
        setTimeout(() => {
            handleCloseInfoMap();
        }, 200); 
    };
    
   /*******************************************************************************************************************************************************/
    
    return(
        <div className="infoMapContainer" 
            onMouseEnter={() => setIsMouseOverComponent(true)} 
            onMouseLeave={() => setIsMouseOverComponent(false)}>
            <div className={`itemsInfoMap ${closingInfoMap ? 'closingInfoMap' : ''}`}>
                <div className="infoMapNavbar">
                    <h2 className="infoMapNavbarTitle">Información del Mapa</h2>
                    <FontAwesomeIcon className="closeIconInfoMapNavbar" icon={faXmark} onClick={handleCloseEffect}/>
                </div>
                <div className="infoMapContent">
                    <div className="mapNameContainer">
                        <h1 className="mapName">Estudios Hidrológicos en Cuencas Pobremente Aforadas</h1>
                    </div>
                    <div className="mapDescriptionContainer">
                        <div className="mapDescriptionTitleContainer">
                            <h2 className="mapDescriptionTitle">Descripción</h2>
                        </div>
                        <div className="mapDescription">
                            <p>
                                La aplicación web ofrece la visualización y descarga de la Precipitación Total Mensual (PTM) y del Índice de Precipitación Estandarizado (SPI), 
                                en todo el territorio de Argentina. Ambos datos se calculan automáticamente a partir del procesamiento de las imágenes diarias de precipitación 
                                del producto IMERG (Integrated Multi-satellite Retrievals for GPM), versión “V07 Late Run”, con una resolución espacial de 0,1° (aproximadamente 
                                111 km²) y una cobertura temporal desde el 01 de junio de 2000 hasta la fecha actual con un retraso de 2 días.
                            </p>
                            <p>
                                Los autores de esta herramienta y las instituciones participantes no se responsabilizan por el mal uso o interpretación de la 
                                información proporcionada. Esta herramienta está diseñada para servir como referencia en la planificación, gestión y diseño de 
                                obras hídricas de pequeña y mediana magnitud, así como para evaluar la severidad local de eventos relacionados con excesos y 
                                déficits hídricos. Los requerimientos normativos están definidos por las autoridades provinciales, municipales y/o jurisdiccionales 
                                pertinentes. 
                            </p>
                            <p>
                                Los resultados se basan en información de libre disponibilidad (Huffman et al., 2024) y en desarrollos presentados en 
                                tesis doctorales y artículos técnicos (Catalini, 2018; Bazzano, 2019; Catalini et al., 2021; Catalini et al., 2023), así como en 
                                otros estudios en desarrollo en la Facultad de Ingeniería de la Universidad Católica de Córdoba.
                            </p>
                            <p>
                                La calidad de los datos suministrados y los algoritmos desarrollados es orientativa y está sujeta a verificación en campo.
                            </p>
                        </div>                    
                    </div>
                    <div className="mapPTMContainer">
                        <div className="mapPTMTitleContainer">
                            <h2 className="mapPTMTitle">Precipitación Total Mensual</h2>
                        </div>
                        <div className="mapPTM">
                            <p>
                                La Precipitación Total Mensual (PTM) es la suma de todas las precipitaciones registradas en un área específica durante el transcurso de un mes. 
                                Este valor representa la cantidad total de agua caída en forma de lluvia, nieve u otros tipos de precipitación en ese período. Se utiliza 
                                comúnmente para evaluar el comportamiento de las precipitaciones en una región y es clave para el análisis hidrológico, la planificación 
                                agrícola y la gestión de recursos hídricos. La PTM puede variar considerablemente entre regiones y meses, dependiendo de factores climáticos 
                                locales y estacionales. 
                            </p>
                            <p>
                                A continuación, se presenta la referencia de valores (leyenda) del PTM, en milímetros [mm], que se observa en el mapa:
                            </p>
                            <div className="PTMLeyendContainer">
                                <img src={PTMLeyend} alt="" className="PTMLeyend"/>
                            </div>
                        </div>                    
                    </div>
                    <div className="mapSPIContainer">
                        <div className="mapSPITitleContainer">
                            <h2 className="mapPTMTitle">Índice de Precipitación Estandarizado</h2>
                        </div>
                        <div className="mapSPI">
                            <p>
                                El Índice Estandarizado de Precipitación (SPI) desarrollado por McKee, et al. 1993, es uno de los índices más comúnmente utilizados por el sensoramiento 
                                remoto de datos. El SPI, es un potente y flexible índice, sencillo de determinar, ya que el único parámetro necesario para su cálculo es la precipitación.
                                El mismo capaz de representar eventos de excesos y déficit hídrico, y analizar períodos comprendidos por ciclos húmedos y secos, en un territorio especifico.
                            </p>
                            <p>
                                Para el SPI se establecen distintas escalas temporales que permiten observar diferentes cuestiones a corto plazo y a largo plazo:
                            </p>
                            <ul>
                                <li className="liSPIScale">
                                    SPI 1 mes: Refleja las condiciones a corto plazo, su aplicación puede relacionarse estrechamente con tipos meteorológicos de sequia junto con la humedad
                                    del suelo y el estres de los cultivos a corto plazo.
                                </li>
                                <li className="liSPIScale">
                                    SPI 2 a 3 meses: Refleja las condiciones de humedad a corto y mediano plazo, y proporciona una estimación estacional de la precipitación.
                                </li>
                                <li className="liSPIScale">
                                    SPI 6 a 9 meses: Indica tendencias de precipitación entre estaciones y el mediano plazo. La información derivada de este refleja caudales fluviales y niveles 
                                    de almacenamiento anómalos, en función de la región y época del año.
                                </li>
                                <li className="liSPIScale">
                                    SPI 12, 24, 36, 48, 60 y 72 meses: En estas escalas temporales se reflejan patrones de precipitación de largo plazo.
                                </li>
                            </ul>
                            <p>
                                Por otro lado, se establece tanto para el deficit, como el exceso hídrico, un rango estandarizado de influencia. A continuación, se presenta la referencia de valores 
                                (leyenda) del SPI, que se observa en el mapa:
                            </p>
                            <div className="SPILeyendContainer">
                                <img src={SPILeyend} alt="" className="SPILeyend"/>
                            </div>
                        </div>                    
                    </div>
                    <div className="mapDownloadContainer">
                        <div className="mapDownloadTitleContainer">
                            <h2 className="mapDownloadTitle">Descarga de Datos</h2>
                        </div>
                        <div className="mapDownload">
                            <p>
                                Los datos se descargan desde el 01 de junio de 2000 hasta la fecha actual con un retraso de 2 días. Tomando el dia de hoy, {todayDay} de {todayMonth} de {todayYear}, los 
                                datos se descargarían hasta el {lastBandDay} de {lastBandMonth} de {lastBandYear}. 
                            </p>
                            <p>
                                Los archivos descargados (tanto para el PTM como para el SPI en todas las escalas) indican la fecha de calibración de la siguiente manera:  
                            </p>
                            <ul>
                                <li className="liDownload">
                                    PTM_jun_2000_{calibrationDate}
                                </li>
                                <li className="liDownload">
                                    SPI_jun_2000_{calibrationDate}
                                </li>
                            </ul>
                            <p>
                                En el sistema, la última banda es parcial, es decir, se están descargando datos hasta el hasta el {lastBandDay} de {lastBandMonth} de {lastBandYear}.
                                La página se actualiza automáticamente y diariamente para reflejar esta información.
                            </p>
                            <p>
                                Los datos pueden ser descargados de forma individual o grupal, y es necesario que estén activados en el mapa. Para efectuar la descarga, haga "clic" en el icono <FontAwesomeIcon className="liDownloadIcon" icon={faDownload}/>. 
                            </p>
                            <p>
                                En caso de que ocurra un error durante la descarga, éste será notificado. 
                            </p>
                        </div>
                    </div>
                    <div className="mapViewContainer">
                        <div className="mapViewTitleContainer">
                            <h2 className="mapViewTitle">Visualización de Datos</h2>
                        </div>
                        <div className="mapView">
                            <p>
                                En el mapa, tanto para el PTM como para el SPI, se está visualizando el acumulado de precipitación o los datos del SPI, de cualquier escala, del mes de calibración actual. 
                                Actualmente, se visualizan los datos parciales del mes de {lastBandMonth} del año {lastBandYear} hasta el día {lastBandDay}. La página se actualiza automáticamente para reflejar esta información.
                            </p>
                            <p>
                                Las capas de PTM y SPI, como así también las Capas de Referencia, pueden ser activadas para su visualización en el mapa, o desactivadas para ocultarlas. Por otro lado, 
                                también es posible manipular la opacidad de cada una de las capas. Y para visualizar los valores de PTM o el SPI, active la capa deseada y haga clic en cualquier punto 
                                del mapa.
                            </p>
                        </div>
                    </div>
                    <div className="mapContactContainer">
                        <div className="mapContactTitleContainer">
                            <h2 className="mapContactTitle">Contacto</h2>
                        </div>
                        <div className="mapContact">
                        <p className="uccContact">Secretaria de Investigación y Postgrado UCC</p>
                            <ul>
                                <li className="liContact">
                                    Correo Electrónico 1: carlos.catalini@ucc.edu.ar
                                </li>
                                <li className="liContact">
                                    Correo Electrónico 2: posgrado.ing@ucc.edu.ar
                                </li>
                                <li className="liContact">
                                    Dirección: Universidad Católica de Córdoba - Campus Universitario, Av. Armada Argentina 3555, X5016DHK, Ciudad de Córdoba, Argentina.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default InfoMap
