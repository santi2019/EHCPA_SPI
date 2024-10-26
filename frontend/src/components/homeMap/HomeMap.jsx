import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents, Tooltip  } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css";
import 'leaflet-geoserver-request';
import "./homemap.css";
import MapMouseCoordinates from './mapMouseCoordinates/MapMouseCoordinates';
import MapSearchBar from './mapSearchBar/MapSearchBar';
import MapZoomController from './mapZoomController/MapZoomController';
import MapScaleController from './mapScaleController/MapScaleController';
import MapReferenceLayers from './mapReferenceLayers/MapReferenceLayers';
import MapMenu from './mapMenu/MapMenu';


const HomeMap = () => { 

    const centerCoordinates = {lat: '-32.4146', lng:'-63.1821'}
    const [markerPosition, setMarkerPosition] = useState(null);
    const zoom = 7
    const minZoom = 3 
    const maxZoom = 18
    const attributionControlValue = false 
    const [temporaryCoordinates, setTemporaryCoordinates] = useState(null)
    const [temporaryZoom, setTemporaryZoom] = useState();
    const [shouldCenterMap, setShouldCenterMap] = useState(false);
    const [isMouseOverComponent, setIsMouseOverComponent] = useState(false);
    const [markerPopupContent, setMarkerPopupContent] = useState(null);
    

    /* Función handleSelectLocation: sirve para seleccionar una ubicación 
    */
    const handleSelectLocation = (result) => {

        if (result.y && result.x) { 
            setTemporaryCoordinates({
                lat: result.y, 
                lng: result.x 
            });

            setMarkerPosition([result.y, result.x]);
            setMarkerPopupContent(result.label); 
            setShouldCenterMap(true);
        }
        
        if(result.raw.place_rank==4 && result.raw.addresstype=="country"){ //Country (Pais)
            setTemporaryZoom(4);
        }

        if(result.raw.place_rank>=5 && result.raw.place_rank<=9 && result.raw.addresstype=="state"){ // State (Provincia)
            setTemporaryZoom(6);
            if(result.raw.name=="Ciudad Autónoma de Buenos Aires"){
                setTemporaryZoom(10);
            }
        }

        if(result.raw.place_rank>=10 && result.raw.place_rank<=11){
            if(result.raw.addresstype=="state_district"){  // Departamento
                setTemporaryZoom(8);
            }
            if(result.raw.addresstype=="county"){  // Condado
                setTemporaryZoom(12);
            }
            else{
                setTemporaryZoom(10);
            }
        }

        if(result.raw.place_rank>=12 && result.raw.place_rank<=16){ // Town, o City District (Ciudad o Capitales) 
            setTemporaryZoom(12);
    
            if(result.raw.addresstype=="town"){
                setTemporaryZoom(13);
            }
            if(result.raw.addresstype=="village" ){
                setTemporaryZoom(15);
            }
        }

        if(result.raw.place_rank>=17 && result.raw.place_rank<=18){    // Borough (Distrito)
            setTemporaryZoom(16);

            if(result.raw.addresstype=="town" || result.raw.addresstype=="quarter"){
                setTemporaryZoom(18);
            }
        }

        if(result.raw.place_rank>=19 && result.raw.place_rank<=21){   // Villa y Suburb (Suburbio)
            setTemporaryZoom(16);

            if(result.raw.addresstype=="suburb" ){
                setTemporaryZoom(17);
            }
            if(result.raw.addresstype=="neighbourhood" ){ // Neighbourhood (Barrio o Country)
                setTemporaryZoom(18);
            }
        }

        if(result.raw.place_rank==22){  // Neighbourhood (Barrio o Country) 
            if(result.raw.addresstype=="military" || result.raw.addresstype=="residential"){
                setTemporaryZoom(17);
            }else{
                setTemporaryZoom(18);
            } 
        }

        if(result.raw.place_rank>=23 && result.raw.place_rank<=25){  // Municipio, Vecindario 
            setTemporaryZoom(16);
        }      

        if(result.raw.place_rank>=26){ // Roads (Rutas), Streets (Calles), House Number (Numero de Casas), Offices (Oficinas) o Buildings (Edificios)
            setTemporaryZoom(18);
        }
    };





    /* Funcion CenterMap: sirve para centrar el mapa cuando cambian las coordenadas y aplica
                          el correspondiente zoom segun el tipo de ubicacion.
    */
    const CenterMap = ({ center }) => {
        const map = useMap();
        
        useEffect(() => {
            if (shouldCenterMap && center && center.lat && center.lng) {
                map.flyTo([center.lat, center.lng], temporaryZoom);
                setShouldCenterMap(false);
            }
        }, [center, temporaryZoom, map]);

        return null;
    };



    const MapMarkerHandler = ({ isMouseOverComponent }) => {
        useMapEvents({
            click(e) {
                if (!isMouseOverComponent) { 
                    const newMarkerPosition = [e.latlng.lat, e.latlng.lng];
                    setMarkerPosition(newMarkerPosition);
                    setMarkerPopupContent(null);
                }
            }
        });
        return null;  
    };



    const handleRemoveMarker = () => {
        setMarkerPosition(null);  
        setMarkerPopupContent(null);
    };



    return(
        <div className='homeMap'>            
            <MapContainer className="leaflet-container" 
                center={centerCoordinates}  
                zoom={zoom} minZoom={minZoom} maxZoom={maxZoom}
                attributionControl={attributionControlValue}
                zoomControl={false}
                doubleClickZoom={false}>
                <TileLayer
                    attribution={import.meta.env.VITE_OSM_ATTRIBUTION}
                    url={import.meta.env.VITE_ARGEN_MAP_URL}
                />
                <MapMenu setIsMouseOverComponent={setIsMouseOverComponent} isMouseOverComponent={isMouseOverComponent}/>
                <MapReferenceLayers setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapZoomController setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapScaleController setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapMouseCoordinates/>
                <CenterMap center={temporaryCoordinates} zoom={temporaryZoom} />
                <MapSearchBar handleSelectLocation={handleSelectLocation} setIsMouseOverComponent={setIsMouseOverComponent}/>
                <MapMarkerHandler isMouseOverComponent={isMouseOverComponent}/>
                {markerPosition && (
                    <Marker
                        position={markerPosition}
                        eventHandlers={{
                            click: handleRemoveMarker 
                        }}
                    >
                        {markerPopupContent && (
                            <Tooltip direction="top" opacity={1} offset={[-15.5, -12]} permanent>
                                {markerPopupContent}
                            </Tooltip>
                        )}                    
                    </Marker>
                )}
            </MapContainer >
        </div>
    );
};




export default HomeMap

