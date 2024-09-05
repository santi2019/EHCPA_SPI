import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, ScaleControl, useMapEvents, useMap } from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faBars, faXmark, faCircleInfo, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion} from "@fortawesome/free-regular-svg-icons";
import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css";
import "./homemap.css";

const HomeMap = () => { 

    const [centerCoordinates, setCenterCoordinates] = useState({lat: '-32.4135', lng:'-63.18105'})
    const zoom = 7
    const minZoom = 3 
    const maxZoom = 18
    const attributionControlValue = false 
    const [coordinates, setCoordinates] = useState({ lat: '0', lng: '0' });
    //const [showSearch, setShowSearch] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const provider = new OpenStreetMapProvider({
        params: {
            countrycodes: 'AR',
        },
    });

    //Funcion para obentener las coordenadas
    const GetCoordineatesHandler = () => {
        useMapEvents ({
            mousemove(e) {
                setCoordinates({
                    lat: e.latlng.lat.toFixed(3), 
                    lng: e.latlng.lng.toFixed(3)
                });
            }
        });
        return null;
    };


    /*Funcion para actualizar el valor del input
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value); 
    }*/
 
    //Funcion para borrar el contenido del input
    const handleClearSearch = () => {
        setSearchValue('');
        setSearchResults([]);
    };
  
    /*
    const SearchField = () => {

        const searchControl= new GeoSearchControl({
          provider: new OpenStreetMapProvider(),
          style: 'bar',
          showMarker: false,
        });

        const map = useMap();
        useEffect(() => {
          map.addControl(searchControl);
          return () => map.removeControl(searchControl);
        }, []);
      
        return null;
    };

    
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value) {
            try {
                const results = await provider.search({ query: value });
                setSearchResults(results);
                //console.log('Resultados de búsqueda:', results);
            } catch (error) {
                console.error('Error en la busqueda:', error);
            }
        }else{
            setSearchResults([]);
        }
    };
    
    */

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchValue) {
                try {
                    const results = await provider.search({ query: searchValue });
                    setSearchResults(results);
                    setError(null); 
                } catch (error) {
                    setError("Falla en el servidor de OSM");
                    console.error('Error:', error);
                }
            } else {
                setSearchResults([]);
            }
        }, 1500); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);



    return(
        <div className='homeMap'>            
            <MapContainer className="leaflet-container" 
                center={centerCoordinates}  
                zoom={zoom} minZoom={minZoom} maxZoom={maxZoom} 
                attributionControl={attributionControlValue}
                doubleClickZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"/>
            
            <ScaleControl imperial={false} />
            <GetCoordineatesHandler />
            <div className="coordinatesMap"> Lat: {coordinates.lat} Lng: {coordinates.lng}</div>
            <div className="searchMap">
                <form className='searchMapForm' autoComplete="none">
                    <input className="inputSearchMap" type="text" placeholder="Buscar" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}/>
                    <div className="inputItems">
                        <FontAwesomeIcon className="searchIcon" icon={faMagnifyingGlass} />
                        <FontAwesomeIcon className="questionIcon" icon={faCircleQuestion} />
                        {searchValue && (
                        <FontAwesomeIcon className="deleteIcon" icon={faCircleXmark} onClick={handleClearSearch}/>
                        )}
                    </div>
                    {searchResults.length > 0 && (
                            <div className="resultsSearchMap">
                                <ul>
                                    {searchResults.map((result, index) => (
                                        <li key={index}>
                                            {result.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </form>                
            </div>
            </MapContainer>
        </div>
    )
}

//{showSearch && <SearchField className="leaflet-search-bar"/>}
/*
                    <label className="inputLabel">
                        <span className="labelSpan">Buscar</span>
                    </label>
*/


export default HomeMap