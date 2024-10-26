Feature('ehcpa');


Scenario('Visualizar y Descargar PTM',  async ({ I }) => {

    //Abrimos página inicial
    I.amOnPage('http://localhost:5173/');
    I.wait(3);


    //Abrimos el menu
    I.moveCursorTo('.menuButton');
    I.click('.menuButton');
    I.wait(3);


    //Abrimos el modal de Precipitación
    I.moveCursorTo('.buttonContent .rainIcon'); 
    I.click('.buttonContent .rainIcon'); 
    I.moveCursorTo('.precipitationLayerContainer');
    I.see('Precipitación');
    I.wait(3);


    //Desactivamos y activamos la capa de PTM
    I.moveCursorTo('.precipitationLayersContent');
    I.see('Precip. Total Mensual [mm]');
    I.moveCursorTo('.precipitationSwitchText .ant-switch'); 
    I.click('.precipitationSwitchText .ant-switch');
    I.wait(3);
    I.click('.precipitationSwitchText .ant-switch');
    I.wait(3); 


    //Variamos la opacidad
    I.moveCursorTo('.precipitationLayersRange');
    I.dragSlider('.inputRange', -200);
    I.see('0%', '.precipitationOpacityValue');
    I.wait(3);
    I.dragSlider('.inputRange', -10);
    I.see('50%', '.precipitationOpacityValue');
    I.wait(3);
    I.dragSlider('.inputRange', 200);
    I.see('100%', '.precipitationOpacityValue');
    I.wait(3);

    
    //Cerramos el modal de Precipitación
    I.moveCursorTo('.precipitationNavbar .precipitationCloseIcon');
    I.click('.precipitationNavbar .precipitationCloseIcon');
    I.wait(3);

    
    //Verificamos valor de PTM en el mapa
    I.click('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Información', '.draggModalContainer .draggModalNavbar .draggModalNavbarTitle');
    I.see('PTM [mm]:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.wait(3); 


    //Descargamos PTM
    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .downloadIcon'); 
    I.click('.buttonContent .downloadIcon'); 
    I.wait(10);


    //Validamos la descarga
    const alertVisible = await I.grabNumberOfVisibleElements('.swal2-container');
    if (alertVisible > 0) {
        I.dontSee('Atención', '.swal2-title');
        I.dontSee('Oops!', '.swal2-title');
        I.dontSee('Network Error', '.swal2-title');
        I.dontSee('Error Desconocido', '.swal2-title');
    }
    I.wait(5);

});




Scenario('Visualizar y Descargar SPI',  async ({ I }) => {

    //Abrimos página inicial
    I.amOnPage('http://localhost:5173/');
    I.wait(3);


    //Abrimos el menu
    I.moveCursorTo('.menuButton');
    I.click('.menuButton');
    I.wait(3);


    //Abrimos el modal de Precipitación
    I.moveCursorTo('.buttonContent .rainIcon'); 
    I.click('.buttonContent .rainIcon');
    I.moveCursorTo('.precipitationLayerContainer .precipitationNavbar'); 
    I.see('Precipitación');
    I.wait(3);


    //Desactivamos la capa de PTM
    I.click('.precipitationNavbar .ant-switch');
    I.wait(3);


    //Cerramos el modal de Precipitación
    I.moveCursorTo('.precipitationNavbar .precipitationCloseIcon');
    I.click('.precipitationNavbar .precipitationCloseIcon');
    I.wait(3);


    //Abrimos el modal de SPI
    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .spiButtonContent'); 
    I.click('.buttonContent .spiButtonContent'); 
    I.wait(3);


     // Activamos las capas de SPI
     I.moveCursorTo('.spiLayersContainer')
     I.moveCursorTo('.spiLayersContainer .spiNavbar'); 
     I.see('Índice de Precipitación Estandarizado');
     I.moveCursorTo('.spiNavbar .ant-switch'); 
     I.click('.spiNavbar .ant-switch');
     I.wait(8);

     I.moveCursorTo('.spiLayersContent')
     I.see('SPI Escala 1 [Mensual]');
     I.see('SPI Escala 2 [Mensual]');
     I.see('SPI Escala 3 [Mensual]');
     I.wait(3);
 
     I.executeScript(() => {
         const container = document.querySelector('.spiLayersContent');
         container.scrollTop = 247; 
     });

     I.see('SPI Escala 6 [Mensual]');
     I.see('SPI Escala 9 [Mensual]');
     I.see('SPI Escala 12 [Mensual]');
     I.wait(3);
 
     I.executeScript(() => {
         const container = document.querySelector('.spiLayersContent');
         container.scrollTop = 494; 
     });

     I.see('SPI Escala 24 [Mensual]');
     I.see('SPI Escala 36 [Mensual]');
     I.see('SPI Escala 48 [Mensual]');
     I.wait(3);
 
     I.executeScript(() => {
         const container = document.querySelector('.spiLayersContent');
         container.scrollTop = container.scrollHeight; 
     });

     I.see('SPI Escala 60 [Mensual]');
     I.see('SPI Escala 72 [Mensual]');
     I.wait(3);


    //Cerramos el modal de SPI
    I.moveCursorTo('.spiNavbar .spiCloseIcon');
    I.click('.spiNavbar .spiCloseIcon');
    I.wait(3);


    //Verificamos valor de SPI en el mapa
    I.click('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Información', '.draggModalContainer .draggModalNavbar .draggModalNavbarTitle');
    I.see('SPI Escala 1:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 2:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 3:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 6:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.wait(3);

    I.executeScript(() => {
        const container = document.querySelector('.draggModalValuesContainer');
        container.scrollTop = 184; 
    });

    I.see('Información', '.draggModalContainer .draggModalNavbar .draggModalNavbarTitle');
    I.see('SPI Escala 9:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 12:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 24:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 36:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.wait(3);

    I.executeScript(() => {
        const container = document.querySelector('.draggModalValuesContainer');
        container.scrollTop = container.scrollHeight; 
    });

    I.see('SPI Escala 48:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 60:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.see('SPI Escala 72:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.wait(3); 


    //Descargamos SPI
    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .downloadIcon'); 
    I.click('.buttonContent .downloadIcon'); 
    I.wait(20);


    //Validamos la descarga
    const alertVisible = await I.grabNumberOfVisibleElements('.swal2-container');
    if (alertVisible > 0) {
        I.dontSee('Atención', '.swal2-title');
        I.dontSee('Oops!', '.swal2-title');
        I.dontSee('Network Error', '.swal2-title');
        I.dontSee('Error Desconocido', '.swal2-title');
    }
    I.wait(5);

 });

 


 Scenario('Buscar Ubicacion',  async ({ I }) => {

    //Abrimos página inicial
    I.amOnPage('http://localhost:5173/');
    I.wait(3);


    //Escribimos la ubicación a buscar
    I.moveCursorTo('.searchMap');
    I.fillField('.inputSearchMap', 'Cordoba, Argentina');
    I.wait(3);


    //Buscamos la ubicación
    I.moveCursorTo('.iconsSearchMap');
    I.click('.iconsSearchMap .searchIcon');
    I.wait(4);


    //Verificamos los resultados de la busqueda
    I.dontSeeElement('.resultsSearchMap .itemsResultsSearchMap .liNotFound');
    I.dontSeeElement('.resultsSearchMap .itemsResultsSearchMap .liError');
    I.seeElement('.resultsSearchMap .itemsResultsSearchMap .liResults');
    I.see('Córdoba, Argentina', '.liResults');
    I.see('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina', '.liResults');
    I.wait(3);
    
    
    // Seleccionamos la ubicación
    I.click(locate('.liResults').withText('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina'));
    I.wait(8);


    //Verificamos la ubicación en el mapa
    I.moveCursorTo('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina', '.leaflet-tooltip');
    I.wait(5);
    
});