import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';

const MapShapeFiles = () => {
    const map = useMap();
    const [wmsCuencasLayers, setWmsCuencasLayers] = useState(null);
    
    useEffect(() => {

        const wmsARGLayer = L.Geoserver.wms("http://localhost:8080/geoserver/EHCPA/wms", {
            layers:"EHCPA:Provincias",
            format: 'image/png',
        });

        map.addLayer(wmsARGLayer);

        const wmsShpLayer = L.Geoserver.wms("http://localhost:8080/geoserver/EHCPA/wms", {
            layers: "EHCPA:Cca_Embalse",
            format: 'image/png',
        });

        setWmsCuencasLayers(wmsShpLayer);

        const handleZoom = () => {
            const currentZoom = map.getZoom();
            if (currentZoom >= 6) {
                if (!map.hasLayer(wmsShpLayer)) {
                    map.addLayer(wmsShpLayer);  
                }
            } else {
                if (map.hasLayer(wmsShpLayer)) {
                    map.removeLayer(wmsShpLayer);  
                }
            }
        };
        map.on('zoomend', handleZoom);
        handleZoom();

        return () => {
            map.off('zoomend', handleZoom);
            if (map.hasLayer(wmsShpLayer)) {
                map.removeLayer(wmsShpLayer); 
            }
        };
    }, [map]);

    return null;
};

export default MapShapeFiles;
