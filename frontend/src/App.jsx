import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from './pages/homepage/Homepage';

/*******************************************************************************************************************************************************/

/**
 * Funcion App: Define la estructura y lógica de enrutamiento de la aplicación.
 * Su estructura es la siguiente:
 * - BrowserRouter: Este componente envuelve toda la aplicación y habilita la funcionalidad de enrutamiento en una aplicación React. Gestiona la historia 
 *   de navegación del navegador, permitiendo que la aplicación reaccione a los cambios en la URL.
 * - Routes: Componente que actua como un contenedor que organiza los diferentes componentes "Route" que definen las rutas a cada componente o vista.
 *   - Homepage: Importamos el componente de la página principal, que se mostrará en la ruta raíz "/"" de la aplicación.
 * - Por ultimo, se exporta "Homepage" como componente.
*/ 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
