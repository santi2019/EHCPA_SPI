import React from 'react'
import "./homepage.css";
import HomeNavbar from "../../components/homeNavbar/HomeNavbar";
import HomeFooter from '../../components/homeFooter/HomeFooter';
import HomeMap from '../../components/homeMap/HomeMap';

/*******************************************************************************************************************************************************/

/**
 * Pagina Homepage: Pagina inicial del sitio web EHCPA.
 * Su estructura es la siguiente:
 * - homeContainer: Contenedor general que contiene los siguientes componentes:
 *   - HomeNavbar: Navbar del sitio web.
 *   - HomeMap: Contenido del sitio web, en donde se incluye:
 *     - Menu para la visualizacion de capas PTM y SPI (incluyendo el modal de visualizacion de datos), informacion del mapa y la descarga de archivos.
 *     - Buscador de ubicaciones.
 *     - Control del zoom del mapa.
 *     - Visuzalizador de capas de referencia.
 *     - Visualizador de la escala del mapa.
 *     - Visualizador de coordenadas del mouse en el mapa.
 *   - HomeFooter: Footer del sitio web.
 * - Por ultimo, se exporta "Homepage" como componente.
*/

const Homepage = () => {
 
    return(
        <div className="homeContainer">
            <HomeNavbar />
            <HomeMap />
            <HomeFooter />
        </div>
    )
    
}


export default Homepage