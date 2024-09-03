import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';
import FileDownload from "js-file-download"
import Swal from 'sweetalert2' 
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./homebody.css";

const HomeBody = () => {
 
    const [error, setError] = useState();
   
    const handleClick = async (e) => {
        e.preventDefault();
    
        try {
            const res = await axios.get('http://127.0.0.1:8080/download', {
                responseType: 'blob',
                onDownloadProgress: function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                        const percentComplete = ((progressEvent.loaded / progressEvent.total) * 100).toFixed()
                        console.log( percentComplete + "%");
                    } else {
                        console.log("Descarga en proceso, por favor espere...");
                    }
                }
            });
                console.log(res.data);
                FileDownload(res.data, 'EHCPA_Data.zip');
                /*const url = URL.createObjectURL(res.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'EHCPA_Data.zip';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);*/
        } catch (error) {  //Manejamos de esta manera el error porque es un blob
            if (error.response && error.response.data) {
                const errorBlobText = await error.response.data.text();
                const errorMessage = JSON.parse(errorBlobText);
                setError(errorMessage.message);
                console.error("Error:", errorMessage.message);
                //alert("Error: " + errorMessage.message);
                Swal.fire({
                    title: 'Oops!',
                    text: errorMessage.message,
                    icon: 'error',
                    confirmButtonText: 'Continuar'
                  })
            } else {
                const otherError = error.message
                setError(otherError);
                console.error("Error:", otherError);
            }
        }
    };
    
        
    
    return(
        <div className='homeBody'>
            <div className="divElements">
                <h2>Descargar datos</h2>
                <button className="formButton" onClick={(e)=>handleClick(e)}>Descargar</button>
            </div>    
        </div>
    )

      /*<div className="errorContainer">
                    {error && <span>{error}</span>}
        </div>*/
}

export default HomeBody