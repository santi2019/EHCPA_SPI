# EHCPA_SPI

#### Alumno: Vietto Herrera Santiago
#### Directores: 
* #### Ing. Luciano Ignacio Carreño
* #### Ing. Federico Eduardo Porrini 
#### Co-Director: Dr. Ing. Carlos Gastón Catalini
#### Institución: Universidad Católica de Córdoba
#### Año: 2024

## Descripción 

El siguiente repositorio... (Descripcion del sitio web y el proyecto) 



## Instalación y Configuración

### Backend

#### Instalación y Gestión de Entorno Virtual:

El backend de este proyecto está desarrollado en `Python`, utilizando `Conda` como entorno virtual para gestionar las dependencias y asegurar una ejecución estable y controlada. 

Para la creación del entorno virtual, primero es necesaria la instalación del gestor de paquetes y entornos `Conda` en el sistema operativo. 

El sistema cuenta con el archivo `environment.yml`, el cual especifica las todas las dependencias, bibliotecas y librerias necesarias, y sus respectivas versiones, para el correcto funcionamiento del backend. Por ende, este mismo es utilizado para la creación y gestión del entorno virtual.

1. Para crear el entorno virtual, nos posicionamos en `/backend` y ejecutamos:
    
    ```bash
    conda env create -f environment.yml
    ```
2. Para actualizar el entorno virtual, luego de haber realizado cambios o modificaciones en el archivo `environment.yml`, nos posicionamos en `/backend` ejecutamos:
    
    ```bash
    conda env update -f environment.yml
    ```

#### Servicio:

El servicio backend está construido sobre `Flask`, un framework ligero de `Python` ideal para desarrollar aplicaciones web y APIs RESTful. `Flask` facilita el desarrollo de aplicaciones escalables, lo que permite manejar múltiples endpoints y lógicas complejas con una estructura de código organizada. Este servicio está configurado para escuchar peticiones, responder con datos procesados y manejar las operaciones de comunicación con el frontend.

* Para levantar el servicio es necesario ejecutar el archivo `app.py` ubicado en el directorio `/backend`.

#### Variables de Entorno:

Para que el backend pueda ejecutar sus funcionalidades y conectarse con los diferentes servicios externos, es necesaria la creación y configuración de un archivo `.env`. En dicho archivo se definen todas aquellas variables sensibles como rutas, puertos y credenciales necesarias. Los pasos a seguir para la configuración del archivo `.env` son los siguientes:

1. Crear la carpeta `credentials` en el directorio `/backend/src`.

2. Crear el archivo `.env` en el directorio `/backend/src/credentials`, con la siguiente estructura, y posteriormente asignarle a cada variable su respectivo valor:
    
    ```bash
    #Variables de configuración del Backend
    BACKEND_PORT=
    

    #Credenciales/URLs GES DISC NASA
    NASA_SERVICE_SUBSET_JSONWSP=""
    NASA_API_JOBS_RESULT=""
    NASA_URS=""
    NASA_USERNAME=""
    NASA_PASSWORD=""


    #Credenciales Email
    EHCPA_EMAIL=""
    EHCPA_PASSWORD=""
    VIETTO_EMAIL=""
    SMTP_GMAIL_SERVER=""
    SMTP_PORT=
    IMAP_GMAIL_SERVER=""


    #Credenciales/URLs GeoServer
    GEOSERVER_URL=""
    GEOSERVER_USERNAME=""
    GEOSERVER_PASSWORD=""


    #Credenciales S3 AWS
    AWS_ACCESS_KEY=""
    AWS_SECRET_ACCESS_KEY=""
    AWS_S3_BUCKET_NAME=""
    AWS_S3_PREFIX=""


    # Variables para verificar la conexión a Internet
    CHECK_INTERNET_HOST=""
    CHECK_INTERNET_PORT=
    ```

### Frontend

#### Servicio e Instalación de Dependencias:

El frontend del proyecto está desarrollado en `React.js`, una biblioteca de `JavaScript` utilizada para crear interfaces de usuario interactivas y reactivas. Esta aplicación fue configurada utilizando `Vite.js`, un potente y moderno sistema de construcción de aplicaciones. `Vite.js` se destaca por su velocidad en el desarrollo, ya que emplea un servidor de desarrollo optimizado y maneja módulos de manera nativa, permitiendo recargas rápidas y una experiencia fluida durante el desarrollo. Además, facilita la construcción final para producción mediante su empaquetador eficiente y flexible.

Para instalar las dependencias del proyecto, y posteriormente levantar el servicio, se deben seguir los siguientes pasos:

1. Posicionarse en el directorio `/frontend`, y luego ejecutar el siguiente comando para instalar las dependencias:

    ```bash
    npm install
    ```

2. Para levantar el servicio es necesario posicionarse en el directorio `/frontend`, y luego ejecutar el siguiente comando:
    
    ```bash
    npm run dev
    ```

#### Variables de Entorno:

Para que el frontend pueda ejecutar sus funcionalidades y conectarse con los diferentes servicios externos, es necesaria la creación y configuración de un archivo `.env`. En dicho archivo se definen todas aquellas variables sensibles como rutas, puertos y credenciales necesarias. Los pasos a seguir para la configuración del archivo `.env` son los siguientes:

1. Crear el archivo `.env` en el directorio `/frontend`.

2. Establecer en el archivo `.env` la siguiente estructura, y posteriormente asignarle a cada variable su respectivo valor:

    ```bash
    #Map services URLs:
    VITE_OSM_ATTRIBUTION=''
    VITE_ARGEN_MAP_URL=""


    #GeoServer URL:
    VITE_GEOSERVER_DATA_URL=''


    #Backend URLs:
    VITE_BACKEND_GET_DATES_URL=''
    VITE_BACKEND_DOWNLOAD_URL=''
    ```

### Integration Tests

#### Instalación de Dependencias y Ejecución:

Las pruebas de integración de este proyecto se implementan mediante `CodeceptJS`, un moderno framework de pruebas de aceptación y end-to-end que permite la automatización de flujos de usuario de manera eficiente y estructurada. `CodeceptJS` facilita la escritura de pruebas descriptivas y legibles, diseñadas para asegurar que cada funcionalidad del sistema, desde la autenticación hasta la navegación, funcione de manera correcta en la interfaz de usuario. Para llevar a cabo estas pruebas, `CodeceptJS` se apoya en `Playwright`, una biblioteca de automatización que permite realizar pruebas en navegadores modernos y soporta múltiples motores de renderizado como Chromium, Firefox y WebKit. `Playwright` proporciona un control completo del navegador, permitiendo la simulación de interacciones complejas del usuario en tiempo real.

Para ejecutar las pruebas de integración y validar el funcionamiento completo del sistema, es necesario activar de ante mano tanto el servicio `backend` como el `frontend`. Esto asegura que las pruebas puedan interactuar con todas las funcionalidades del sistema en un entorno real, evaluando la comunicación entre el cliente y el servidor, y verificando que todas las interacciones de usuario se reflejen correctamente en ambas capas.

Para instalar las dependencias, y posteriormente ejecutar los tests de integración, se deben seguir los siguientes pasos:

1. Activar servicio de `backend`.

2. Activar servicio de `frontend`.

3. Posicionarse en el directorio `/integration_tests`, y luego ejecutar los siguientes comandos para instalar las dependencias:

    ```bash
    npm install --force

    npx playwright install --force
    ```

4. Para ejecutar los tests de integración el servicio es necesario posicionarse en el directorio `/integration_tests`, y luego ejecutar el siguiente comando:
    
    ```bash
    npx codeceptjs run --steps
    ```

#### Variables de Entorno:

Para que las pruebas de integración puedan ejecutar sus funcionalidades y conectarse con los diferentes servicios externos, es necesaria la creación y configuración de un archivo `.env`. En dicho archivo se definen todas aquellas variables sensibles como rutas, puertos y credenciales necesarias. Los pasos a seguir para la configuración del archivo `.env` son los siguientes:

1. Crear el archivo `.env` en el directorio `/integration_tests`.

2. Establecer en el archivo `.env` la siguiente estructura, y posteriormente asignarle a cada variable su respectivo valor:

    ```bash
    #Frontend URL:
    FRONTEND_URL=""
    ```



