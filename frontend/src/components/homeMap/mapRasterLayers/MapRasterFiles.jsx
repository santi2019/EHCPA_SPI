import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';

const MapRasterFiles = () => {
    const map = useMap();
    const [wmsCuencasLayers, setWmsCuencasLayers] = useState(null);
    
    useEffect(() => {

        const wmsPTMLayer = L.Geoserver.wms("http://localhost:8080/geoserver/EHCPA/wms", {
            layers:"EHCPA:PTM_Raster",
            format: 'image/png',
        });

        map.addLayer(wmsPTMLayer);
        
    }, [map]);

    return null;
};

export default MapRasterFiles;
