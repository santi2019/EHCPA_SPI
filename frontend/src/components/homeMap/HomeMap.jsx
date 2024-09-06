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
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [notFoundResults, setNotFoundResults] = useState("");
    const [temporaryCoordinates, setTemporaryCoordinates] = useState(null)
    const [temporaryZoom, setTemporaryZoom] = useState();
    const provider = new OpenStreetMapProvider({
        params: {
            countrycodes: 'AR',
        },
    });
    const [shouldCenterMap, setShouldCenterMap] = useState(false);




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

  


    /* Funcion para actualizar el valor del input al escribir algo, y hacer 
       desaparecer la caja de resultados o mensajes de error, al apretar borrar
       el contenido dentro del input.
    */
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (!value) {
            setSearchResults([]);
            setNotFoundResults("");
            setError(null);
        }
    };
    


    /*Funcion para buscar las ubicaciones*/
    const handleSearch = () => {
        if (searchValue) {
            const delay = setTimeout(async () => {
                try {
                    const results = await provider.search({ query: searchValue });
                    setSearchResults(results);

                    if (results.length === 0) {
                        const notFoundMessage = "No se encontraron resultados en la busqueda."
                        setNotFoundResults(notFoundMessage)
                    } 
                } catch (err) {
                    const osmServerErrorMessage = "Falla en el servidor de OSM."
                    setError(osmServerErrorMessage);
                    console.error('Error:', err);
                }
            }, 1200);
            return () => clearTimeout(delay);
        } else {
            setSearchResults([]);
            setNotFoundResults("");
            setError(null);
        }

    };
    



    // Función para seleccionar una ubicación
    const handleSelectLocation = (result) => {
        console.log(result)
        if (result.y && result.x) { 
            setTemporaryCoordinates({
                lat: result.y, 
                lng: result.x 
            });
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




    
    // Componente para centrar el mapa cuando cambian las coordenadas
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





    /* Funcion para borrar el contenido del input, y hacer desaparecer la
       caja de resultados o mensajes de error, al apretar el icono de X.
    */
    const handleClearSearch = () => {
        setSearchValue('');
        setSearchResults([]);
        setNotFoundResults('');
        setError(null)
        setTemporaryCoordinates({ lat: '', lng: ''});
        setTemporaryZoom();
    };





    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(); 
    };





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
            <div className="coordinatesMap"> 
                <GetCoordineatesHandler />
                Lat: {coordinates.lat} Lng: {coordinates.lng}
            </div>
            <CenterMap center={temporaryCoordinates} zoom={temporaryZoom} />
            <div className="searchMap">
                <form className='searchMapForm' autoComplete="none" onSubmit={handleFormSubmit}>
                    <input className="inputSearchMap" type="text" placeholder="Buscar" value={searchValue} onChange={handleSearchChange}/>
                    <div className="inputItems">
                        <FontAwesomeIcon className="searchIcon" icon={faMagnifyingGlass} onClick={handleSearch}/>
                        <FontAwesomeIcon className="questionIcon" icon={faCircleQuestion} />
                        {searchValue && (
                        <FontAwesomeIcon className="deleteIcon" icon={faCircleXmark} onClick={handleClearSearch}/>
                        )}
                    </div>
                    {(searchResults.length > 0 || notFoundResults || error) && (
                        <div className="resultsSearchMap">
                            <ul>
                                {searchResults.length > 0 ? (
                                    searchResults.map((result, index) => (
                                        <li className='liResults' key={index} onClick={() => handleSelectLocation(result)}>
                                            {result.label}
                                        </li>
                                    ))
                                ):(
                                    <>
                                        {notFoundResults && <li className='liNotFound'>{notFoundResults}</li>}
                                        {error && <li className='liError'>{error}</li>}
                                    </>
                                )}
                            </ul>
                        </div>
                    )}
                </form>                
            </div>
            </MapContainer>
        </div>
    )
}



export default HomeMap




/*TRASH

    const [showSearch, setShowSearch] = useState(true);

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
                    setSearchResults(error);
                }
            } else {
                setSearchResults([]);
            }
        }, 1200); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);




    {showSearch && <SearchField className="leaflet-search-bar"/>}

    <label className="inputLabel">
        <span className="labelSpan">Buscar</span>
    </label>
*/