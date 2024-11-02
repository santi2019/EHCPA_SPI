import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ReactDOM from "react-dom";

/*******************************************************************************************************************************************************/

/**
 * Archivo main: Define la estructura y lógica de enrutamiento de la aplicación.
 * Su estructura es la siguiente:
 * - Selecciona el elemento HTML con el id="root" (el contenedor de nuestra aplicación en el archivo HTML) y mediante "createRoot" se conecta a él. Luego, 
 *   usa el método .render(...) para renderizar el componente raíz <App /> dentro del contenedor root.
 * - StrictMode: Herramienta de desarrollo en React que ayuda a identificar problemas potenciales en una aplicación. Al envolver el componente "App"
 *   React activará advertencias adicionales y verificará aspectos de la aplicación.
 * - App: Es el componente raíz de la aplicación. Este componente contiene la estructura principal y los otros componentes de la aplicación.
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
