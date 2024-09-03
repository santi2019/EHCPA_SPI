import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "./homemap.css"

const HomeMap = () => { 

    return(
        <div className='homeMap'>
            <MapContainer className="leaflet-container" center={{lat: '-32.4135', lng:'-63.18105'}}  zoom={7} minZoom={3} maxZoom={15} attributionControl={false}>
            <TileLayer
                //attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"/>
            </MapContainer>
        </div>
    )

}

export default HomeMap