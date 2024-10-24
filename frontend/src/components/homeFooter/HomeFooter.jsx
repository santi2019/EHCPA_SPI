import React from 'react'
import "./homefooter.css";

/**
     * Componente Footer: Su estructura es la siguiente:
     * - homeFooter: Contenedor general.
     * - footerItem: Contenedor que se utiliza para estructurar los elementos que seran incluidos en el Footer.
     * - Por ultimo, se exporta "HomeFooter" como componente.
*/

const HomeFooter = () => { 
      
    return(
        <div className="homeFooter">
            <div className="footerItem">
                <span className="footerText">© 2024 UCC. All Rights Reserved.</span>
            </div>
        </div>
    )
    
}


export default HomeFooter