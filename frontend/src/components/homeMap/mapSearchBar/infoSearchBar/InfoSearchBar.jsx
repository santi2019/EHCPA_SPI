import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark} from "@fortawesome/free-solid-svg-icons";
import "./infosearchbar.css";

/*******************************************************************************************************************************************************/

/**
 * Componente InfoSearchBar: Permite visualizar un modal con información sobre el funcionamiento de la barra de búsqueda. 
 * Su estructura es la siguiente:
 * - infoSearchContainer: Contenedor general el cual produce un efecto de oscurecimiento del fondo.
 * - itemsInfoSearchModal: Contenedor que se utiliza para estructurar todo el contenido del modal. Si el estado de "closing" es "true", se agrega 
 *   dinamicamente la clase CSS "closing", para la animación de cierre, es decir, un efecto de reduccion. Y si "closing" es "false", la clase "closing" 
 *   no se aplica, ya que significa que el modal se abrio, y se visualiza un efecto de expancion.
 * - infoSearchModalNavbar: Contenedor que se utiliza para estructurar el contenido del navbar del modal, como el titulo y el icono de "X" de cierre. 
 * - infoSearchModalContent: Contenedor que abarca todos los textos informativos del modal.
 * - Por ultimo, se exporta "InfoSearchBar" como componente.
*/

const InfoSearchBar = ({ handleCloseInfoModal, setIsMouseOverComponent }) => { 
    
    /** Estados y variables:
     * - closing: Estado que indica si el modal esta en proceso de cerrarse, y se utiliza para activar la animación de cierre. Inicialmente es "false" y 
     *   mediante "setClosing" actualizamos el estado del mismo.
    */

    const [closing, setClosing] = useState(false);

    /*******************************************************************************************************************************************************/

    /** Funcion handleCloseEffect: Sirve para aplicar la animacion de cierre del modal.
     *  1. Se setea el estado "closing" como "true" para indicar que el modal esta en proceso de cerrarse. Y esto ayuda a indicar que se aplicara la clase 
     *     CSS "closing" que activa la animacion de cierre.
     *  2. Al setear "false" en setIsMouseOverComponent() indicamos que el mouse ya no está sobre ese componente, en este caso el modal.
     *  3. Mediante "setTimeout" asignamos un delay para esperar 200 milisegundos, tiempo que coincide con la duración de la animacion de cierre, antes de 
     *     ejecutar la funcion "handleCloseInfoModal", que efectivamente cierra el modal.
    */ 

    const handleCloseEffect = () => {
        setClosing(true);
        setIsMouseOverComponent(true) 
        setTimeout(() => {
            handleCloseInfoModal();
        }, 200); 
    };

    /*******************************************************************************************************************************************************/
    
    return(
        <div className="infoSearchContainer">
            <div className={`itemsInfoSearchModal ${closing ? 'closing' : ''}`}>
                <div className="infoSearchModalNavbar">
                    <h2 className="infoSearchModalNavbarTitle">Información del Buscador</h2>
                    <FontAwesomeIcon className="closeIconInfoSearchModalNavbar" icon={faXmark} onClick={handleCloseEffect}/>
                </div>
                <div className="infoSearchModalContent">
                    <p>
                        El buscador solo sirve para redirigir al usuario a una ubicación específica en el mapa.
                        Las búsquedas de ubicaciones están limitadas únicamente dentro de Argentina, lo que significa que si se intenta buscar 
                        una ubicación por fuera del país, no se obtendrán resultados. 
                    </p>
                    <p>En este mapa usted puede buscar por:</p>
                    <ul>
                        <li className="liInfoSearchModalContent">Coordenadas en formato: Latitud, Longitud</li>
                        <li className="liInfoSearchModalContent">Dirección Completa</li>
                        <li className="liInfoSearchModalContent">País (solo Argentina)</li>
                        <li className="liInfoSearchModalContent">Provincia, Departamento o Capital</li>
                        <li className="liInfoSearchModalContent">Ciudad, Condado o Distrito</li>
                        <li className="liInfoSearchModalContent">Municipio, Vecindario, Barrio, Suburbio o Country</li>
                        <li className="liInfoSearchModalContent">Rutas, Calles, Número de Casas o Lugares Puntuales (Plazas, Hospitales, Oficinas, Edificos, Etc.)</li>
                    </ul>
                    <p>
                        Presione la tecla "Enter" o haga clic en el ícono <FontAwesomeIcon className="searchIconInfoSearchModalContent" icon={faMagnifyingGlass}/> para buscar. 
                    </p>
                </div>
            </div>
        </div>
    );
};


export default InfoSearchBar
