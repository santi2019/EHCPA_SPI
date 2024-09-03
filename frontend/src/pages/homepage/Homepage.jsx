import React, { useEffect, useState } from 'react'
import "./homepage.css";
import HomeNavbar from "../../components/homeNavbar/HomeNavbar";
import HomeBody from '../../components/homeBody/HomeBody';
import HomeFooter from '../../components/homeFooter/HomeFooter';
import HomeMap from '../../components/homeMap/HomeMap';

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