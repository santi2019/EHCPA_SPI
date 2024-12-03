Feature('ehcpa');

/*******************************************************************************************************************************************************/

/**
 * Test 1: Los casos de uso a validar son:
 * - Visualizar PTM
 * - Descargar PTM
 * Procedimiento:
 * 1. Abrimos página inicial.
 * 2. Abrimos el menu.
 * 3. Abrimos el modal de Precipitación y verificamos que estemos en dicho componente al visualizar el titulo de "Precipitación".
 * 4. Verificamos que se visualice el texto "Precip. Total Mensual [mm]" correspondiente a la capa de PTM, luego desactivamos y volvemos a activar la 
 *    capa de PTM, a traves de su ccorrespondiente switch, para visualizar que la capa se quite y luego se vuelva a renderizar en el mapa.
 * 5. Procedemos a verificar que varie la opacidad de la capa PTM al desplazar el input range.
 *    5.1. Desplazamos el input range a lo maximo a la izquierda, para verificar que el valor de opacidad sea 0% y por otro lado que la capa no sea 
 *         visible en el mapa.
 *    5.2. Desplazamos el input range a la mitad, para verificar que el valor de opacidad sea 50% y por otro lado que la capa no sea sea apenas visible.
 *    5.3. Por ultimo, desplazamos el input range a lo maximo a la derecha, para verificar que el valor de opacidad sea 100% y por otro lado que la capa 
 *         sea totalmente visible en el mapa. 
 * 6. Cerramos el modal de Precipitación al hacer click en el icono de "X".
 * 7. Para verificar los valores de PTM en el mapa, ejecutamos un click en el mapa, en las coordenadas iniciales de centrado del mismo, para renderizar 
 *    el dragg modal con los valores de las coordenadas y el PTM en dicho punto.
 *    7.1. Verificamos que se coloca el marker en el mapa.
 *    7.2. Verificamos que se renderiza el dragg modal visualizando su titulo de "Información".
 *    7.3. Verificamos que aparezca el texto de "PTM [mm]", ya que unicamente se visualiza un unico valor.
 *    7.4. Por ultimo, Verificamos que no aparezcan datos vacio o ningun mensaje de error en el componente "li".
 * 8. Procedemos a realizar la descarga del PTM, por lo que nos movemos al boton de descarga del menu, lo ejecutamos y esperamos unos segundos hasta que
 *    finalice. 
 * 9. Para validar la descarga, almacenamos la cantidad de elementos que posee el contendor "swal2-container" de los alerts de errores, y verificamos que:
 *    - Si el numero de elementos es menor a 0, significa que no salto ninguna alerta, y por ende no ocurrio ningun error y la descarga se efectuo con
 *      exito.
 *    - Si el numero de elementos es mayor a 0, se verifica si se visualiza en el elemento "swal2-title" del contenedor aguno de los siguientes titulos:
 *      "Atención", "Oops!", "Network Error" o "Error Desconocido". Si alguno de estos se visualiza entonces la descarga fallo y el test fallara.
 */
Scenario('Visualizar y Descargar PTM',  async ({ I }) => {

    I.amOnPage(process.env.FRONTEND_URL);
    I.wait(3);

    I.moveCursorTo('.menuButton');
    I.click('.menuButton');
    I.wait(3);

    I.moveCursorTo('.buttonContent .rainIcon'); 
    I.click('.buttonContent .rainIcon'); 
    I.moveCursorTo('.precipitationLayerContainer');
    I.see('Precipitación');
    I.wait(3);

    I.moveCursorTo('.precipitationLayersContent');
    I.see('Precip. Total Mensual [mm]');
    I.moveCursorTo('.precipitationSwitchText .ant-switch'); 
    I.click('.precipitationSwitchText .ant-switch');
    I.wait(3);
    I.click('.precipitationSwitchText .ant-switch');
    I.seeCheckboxIsChecked('[data-layer="PTM"] .ant-switch');
    I.wait(3); 

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

    I.moveCursorTo('.precipitationNavbar .precipitationCloseIcon');
    I.click('.precipitationNavbar .precipitationCloseIcon');
    I.wait(3);

    I.click('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Información', '.draggModalContainer .draggModalNavbar .draggModalNavbarTitle');
    I.see('PTM [mm]:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.dontSee('S/D', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.dontSee('Error:', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems .lidraggModalValues');
    I.wait(3); 

    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .downloadIcon'); 
    I.click('.buttonContent .downloadIcon'); 
    I.wait(10);

    const alertVisible = await I.grabNumberOfVisibleElements('.swal2-container');
    if (alertVisible > 0) {
        I.dontSee('Atención', '.swal2-title');
        I.dontSee('Oops!', '.swal2-title');
        I.dontSee('Network Error', '.swal2-title');
        I.dontSee('Error Desconocido', '.swal2-title');
    }
    I.wait(5);

});

/*******************************************************************************************************************************************************/

/**
 * Test 2: Los casos de uso a validar son:
 * - Visualizar SPI
 * - Descargar SPI
 * Procedimiento:
 * 1. Abrimos página inicial.
 * 2. Abrimos el menu.
 * 3. Abrimos el modal de Precipitación y verificamos que estemos en dicho componente al visualizar el titulo de "Precipitación".
 * 4. Ocultamos la capa de PTM, al desactivar el switch del navbar del modal de Precipitación.
 * 5. Cerramos el modal de Precipitación al hacer click en el icono de "X".
 * 6. Abrimos el modal de SPI y verificamos que estemos en dicho componente al visualizar el titulo de "Índice de Precipitación Estandarizado".
 * 7. Procedemos a activar todas las capas de SPI, activando el switch del navbar del modal de SPI.
 *    7.1. Desplazamos el scroll-bar para abajo en el modal de SPI, para verificar que los switches de todas las capas esten activados, y 
 *         verificamos que se visualice el texto "SPI_(escala)" correspondiente a cada capa de SPI. 
 * 8. Cerramos el modal de SPI al hacer click en el icono de "X".
 * 9. Para verificar los valores de SPI en el mapa, ejecutamos un click en el mapa, en las coordenadas iniciales de centrado del mismo, para renderizar 
 *    el dragg modal con los valores de las coordenadas y el SPI en dicho punto.
 *    9.1. Verificamos que se coloca el marker en el mapa.
 *    9.2. Verificamos que se renderiza el dragg modal visualizando su titulo de "Información".
 *    9.3  Verificamos que no aparezca ningun mensaje de error en los componentes "li".
 *    9.4 Por ultimo, verificamos que aparezcan los textos de "SPI Escala (escala):", desplazando el scroll-bar hacia abajo en el dragg modal validando 
 *        que esten todas las escalas, ya que unicamente se visualizan si las capas estan activadas. No se validan los datos ya que pueden contener un 
 *        valor no null o pueden ser de tipo S/D.
 * 10. Procedemos a realizar la descarga de los SPI, por lo que nos movemos al boton de descarga del menu, lo ejecutamos y esperamos unos segundos hasta 
 *    que finalice. 
 * 11. Para validar la descarga, almacenamos la cantidad de elementos que posee el contendor "swal2-container" de los alerts de errores, y verificamos 
 *     que:
 *    - Si el numero de elementos es menor a 0, significa que no salto ninguna alerta, y por ende no ocurrio ningun error y la descarga se efectuo con
 *      exito.
 *    - Si el numero de elementos es mayor a 0, se verifica si se visualiza en el elemento "swal2-title" del contenedor aguno de los siguientes titulos:
 *      "Atención", "Oops!", "Network Error" o "Error Desconocido". Si alguno de estos se visualiza entonces la descarga fallo y el test fallara.
*/

Scenario('Visualizar y Descargar SPI',  async ({ I }) => {

    I.amOnPage(process.env.FRONTEND_URL);
    I.wait(3);

    I.moveCursorTo('.menuButton');
    I.click('.menuButton');
    I.wait(3);

    I.moveCursorTo('.buttonContent .rainIcon'); 
    I.click('.buttonContent .rainIcon');
    I.moveCursorTo('.precipitationLayerContainer .precipitationNavbar'); 
    I.see('Precipitación');
    I.wait(3);

    I.click('.precipitationNavbar .ant-switch');
    I.wait(3);

    I.moveCursorTo('.precipitationNavbar .precipitationCloseIcon');
    I.click('.precipitationNavbar .precipitationCloseIcon');
    I.wait(3);

    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .spiButtonContent'); 
    I.click('.buttonContent .spiButtonContent'); 
    I.moveCursorTo('.spiLayersContainer')
    I.moveCursorTo('.spiLayersContainer .spiNavbar'); 
    I.see('Índice de Precipitación Estandarizado');
    I.wait(3);

    I.moveCursorTo('.spiNavbar .ant-switch'); 
    I.click('.spiNavbar .ant-switch');
    I.wait(8);

    I.moveCursorTo('.spiLayersContent')
    I.see('SPI Escala 1 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_1"] .ant-switch');
    I.see('SPI Escala 2 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_2"] .ant-switch');
    I.see('SPI Escala 3 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_3"] .ant-switch');
    I.wait(3);
 
    I.executeScript(() => {
        const container = document.querySelector('.spiLayersContent');
        container.scrollTop = 247; 
    });

    I.see('SPI Escala 6 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_6"] .ant-switch');
    I.see('SPI Escala 9 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_9"] .ant-switch');
    I.see('SPI Escala 12 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_12"] .ant-switch');
    I.wait(3);
 
    I.executeScript(() => {
        const container = document.querySelector('.spiLayersContent');
        container.scrollTop = 494; 
    });

    I.see('SPI Escala 24 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_24"] .ant-switch');
    I.see('SPI Escala 36 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_36"] .ant-switch');
    I.see('SPI Escala 48 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_48"] .ant-switch');
    I.wait(3);
 
    I.executeScript(() => {
        const container = document.querySelector('.spiLayersContent');
        container.scrollTop = container.scrollHeight; 
    });

    I.see('SPI Escala 60 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_60"] .ant-switch');
    I.see('SPI Escala 72 [Mensual]');
    I.seeCheckboxIsChecked('[data-layer="SPI_72"] .ant-switch');
    I.wait(3);

    I.moveCursorTo('.spiNavbar .spiCloseIcon');
    I.click('.spiNavbar .spiCloseIcon');
    I.wait(3);

    I.click('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Información', '.draggModalContainer .draggModalNavbar .draggModalNavbarTitle');
    I.dontSee('Error', '.draggModalContainer .draggModalValuesContainer .draggModalValuesItems');
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

    I.moveCursorTo('.menuButton');
    I.moveCursorTo('.buttonContent .downloadIcon'); 
    I.click('.buttonContent .downloadIcon'); 
    I.wait(20);

    const alertVisible = await I.grabNumberOfVisibleElements('.swal2-container');
    if (alertVisible > 0) {
        I.dontSee('Atención', '.swal2-title');
        I.dontSee('Oops!', '.swal2-title');
        I.dontSee('Network Error', '.swal2-title');
        I.dontSee('Error Desconocido', '.swal2-title');
    }
    I.wait(5);

 }); 

/*******************************************************************************************************************************************************/

/**
 * Test 3: Los casos de uso a validar son:
 * - Buscar Ubicación
 * Procedimiento:
 * 1. Abrimos página inicial.
 * 2. Nos movemos a la barra de busqueda y escribimos en el input la ubicación a buscar que en este caso es "Cordoba, Argentina".
 * 3. Ejecutamos la busqueda haciendo click en el icono de la lupa.
 * 4. Verificamos los resultados de la busqueda:
 *    4.1. Validamos que no se renderice el componente que muestra un mensaje indicando que no se encontraron resultados en la busqueda. 
 *    4.2. Validamos que no se renderice el componente que muestra un mensaje indicando que falló la conexión con el servidor de OSM. 
 *    4.3. Por ultimo, validamos que se renderice el componente que muestra los resultados, y a su vez verificamos que se vea un resultado especifico 
 *         que es: "Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina".
 * 5. Seleccionamos el resultado: "Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina".
 * 6. Validamos que la ubicación se renderice en el mapa:
 *    6.1. Verificamos que se coloca el marker en el mapa.
 *    6.2. Visualizamos el texto de la ubicacion seleccionada, en este caso "Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, 
 *         X5000, Argentina" en el componente tooltip del marker en el mapa.
*/

 Scenario('Buscar Ubicacion',  async ({ I }) => {

    I.amOnPage(process.env.FRONTEND_URL);
    I.wait(3);

    I.moveCursorTo('.searchMap');
    I.fillField('.inputSearchMap', 'Cordoba, Argentina');
    I.wait(3);

    I.moveCursorTo('.iconsSearchMap .searchIcon');
    I.click('.iconsSearchMap .searchIcon');
    I.wait(4);

    I.dontSeeElement('.resultsSearchMap .itemsResultsSearchMap .liNotFound');
    I.dontSeeElement('.resultsSearchMap .itemsResultsSearchMap .liError');
    I.seeElement('.resultsSearchMap .itemsResultsSearchMap .liResults');
    I.see('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina', '.liResults');
    I.wait(3);
    
    I.click(locate('.liResults').withText('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina'));
    I.wait(8);

    I.moveCursorTo('.leaflet-container');
    I.seeElement('.leaflet-marker-icon');
    I.see('Córdoba, Municipio de Córdoba, Pedanía Capital, Departamento Capital, Córdoba, X5000, Argentina', '.leaflet-tooltip');
    I.wait(5);
    
}); 