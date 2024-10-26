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

* Para crear el entorno virtual, nos posicionamos en `/backend` y ejecutamos:
    
    ```bash
    conda env create -f environment.yml
    ```
+ Para actualizar el entorno virtual, nos posicionamos en `/backend` ejecutamos:
    
    ```bash
    conda env update -f environment.yml
    ```

#### Servicio:

El servicio backend está construido sobre `Flask`, un framework ligero de `Python` ideal para desarrollar aplicaciones web y APIs RESTful. `Flask` facilita el desarrollo de aplicaciones escalables, lo que permite manejar múltiples endpoints y lógicas complejas con una estructura de código organizada. Este servicio está configurado para escuchar peticiones, responder con datos procesados y manejar las operaciones de comunicación con el frontend.

#### Variables de Entorno:

Para que el backend pueda ejecutar sus funcionalidades y conectarse con los diferentes servicios externos, es necesaria la creación y configuración de un archivo `.env`. En dicho archivo se definen todas aquellas variables sensibles como rutas, puertos y credenciales necesarias. Los pasos a seguir para la configuración del archivo `.env` son los siguientes:

1. Crear la carpeta `credentials` en el directorio `backend/src`.

2. Crear el archivo `.env` en el directorio `backend/src/credentials`, con las siguientes estructura, y posteriormente asignarle a cada variable su respectivo valor:
    
    ```
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

+ Para correr React, nos posicionamos en frontend ejecutamos:
    
    ```bash
    # Instalamos dependencias
    npm install
    # Luego levantamos el servicio
    npm run dev
    ```

### Integration Tests
