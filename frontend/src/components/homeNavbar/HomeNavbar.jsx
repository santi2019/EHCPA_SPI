import React from 'react'
import "./homenavbar.css";
import LogoUCC from "../../assets/images/Logo_UCC.png";

/*******************************************************************************************************************************************************/

/**
 * Componente Navbar: Su estructura es la siguiente:
 *  - homeNavbar: Contenedor general.
 *  - navbarItems: Contenedor que se utiliza para estructurar los elementos que seran incluidos en el Navbar.
 *  - navbarEHCPALogo: Contenedor para estructurar el logo del sitio.
 *      - El texto del titulo posee un enlace para refrescar la pagina. 
 *  - navbarTitle: Contenedor para estructurar el titulo del sitio.
 *  - uccImage: Contenedor para estructurar el logo de la UCC del sitio.
 *      - La imagen posee un enlace que redirige a la pagina inicial de la Universidad Catolica de Cordoba.
 *  - Por ultimo, se exporta "HomeNavbar" como componente.
*/

const HomeNavbar = () => {
      
    return(
        <div className="homeNavbar">
            <div className="navbarItems">
                <div className="navbarEHCPALogo">
                    <a href="/"><h1 className="ehcpalogo">[ EHCPA ]</h1></a>
                </div>
                <div className="navbarTitle">
                    <h2 className="ehcpatitle">Estudios Hidrológicos en Cuencas Pobremente Aforadas</h2>
                </div>
                <div className="navbarUCCLogo">
                    <a href="https://www.ucc.edu.ar/" target="_blank"><img src={LogoUCC} alt="" className="uccImage"/></a>
                </div>
            </div>
        </div>
    )
    
}


export default HomeNavbar