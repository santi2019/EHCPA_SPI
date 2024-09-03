import React, { useEffect, useState } from 'react'
import "./homenavbar.css";
import LogoUCC from "../../assets/images/Logo_UCC.png";

const HomeNavbar = () => {
 
      
    return(
        <div className="homeNavbar">
            <div className="navbarItems">
                <div className="navbarLogo">
                    <a href="/"><h1 className="logo">[ EHCPA ]</h1></a>
                </div>
                <div className="navbarTitle">
                    <h2 className="title">Estudios Hidrológicos en Cuencas Pobremente Aforadas</h2>
                </div>
                <div className="navbarImage">
                    <a href="https://www.ucc.edu.ar/" target="_blank"><img src={LogoUCC} alt="" className="imageucc"/></a>
                </div>
            </div>
        </div>
    )
    
}


export default HomeNavbar