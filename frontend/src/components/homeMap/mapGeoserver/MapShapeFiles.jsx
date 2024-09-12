import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geoserver-request';

const MapShapeFile = () => {
    const map = useMap();
    const [wmsShpLayer, setWmsShpLayer] = useState(null);
    const [wmsPTMLayer, setWmsPTMLayer] = useState(null); 
    
    useEffect(() => {

        const wmsPTMLayer = L.Geoserver.wms("http://localhost:8080/geoserver/EHCPA_SPI/wms", {
            layers: "EHCPA_SPI:PTM_jun_2000_sep_2024_last_band_ARG_cropped",
            format: 'image/png',
        });

        setWmsPTMLayer(wmsPTMLayer);
        map.addLayer(wmsPTMLayer);

        const wmsShpLayer = L.Geoserver.wms("http://localhost:8080/geoserver/EHCPA_SPI/wms", {
            layers: "EHCPA_SPI_GROUP_ShapeFiles",
            format: 'image/png',
        });

        setWmsShpLayer(wmsShpLayer);

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

export default MapShapeFile;
