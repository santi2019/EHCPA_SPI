import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, ScaleControl, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css";
import "./homemap.css";
import MapMouseCoordinates from './mapMouseCoordinates/MapMouseCoordinates';
import MapSearchBar from './mapSearchBar/MapSearchBar';

const HomeMap = () => { 

    const [centerCoordinates, setCenterCoordinates] = useState({lat: '-32.4135', lng:'-63.18105'})
    const zoom = 7
    const minZoom = 3 
    const maxZoom = 18
    const attributionControlValue = false 
    const [temporaryCoordinates, setTemporaryCoordinates] = useState(null)
    const [temporaryZoom, setTemporaryZoom] = useState();
    const [shouldCenterMap, setShouldCenterMap] = useState(false);
    const [isMouseOverSearch, setIsMouseOverSearch] = useState(false);

    

    /* Función handleSelectLocation: sirve para seleccionar una ubicación 
    */
    const handleSelectLocation = (result) => {
        //console.log(result)

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
                <MapMouseCoordinates isMouseOverSearch={isMouseOverSearch}/>
                <CenterMap center={temporaryCoordinates} zoom={temporaryZoom} />
                <MapSearchBar handleSelectLocation={handleSelectLocation} setIsMouseOverSearch={setIsMouseOverSearch}/>
            </MapContainer>
        </div>
    );
};



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