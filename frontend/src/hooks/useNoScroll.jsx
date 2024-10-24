import { useEffect, useRef } from 'react';

/**
     * El siguiente "useEffect" se utiliza para eliminar el borde derecho del contenedor "resultsSearchMap" en caso de
     * que no tenga el scroll-bar. Verifica si el contenedor "resultsSearchMap" tiene mas contenido del que puede mostrarse 
     * a la vez (es decir, si tiene un scrollbar) y, dependiendo de eso, se ajusta la clase CSS del contenedor.
     * 1. Verificamos si el contendor existe, y si es asi, verificamos si el contenido del contenedor es mayor que el área 
     *    visible del contenedor mismo. Para ello, se comparan dos propiedades:
     *      - scrollHeight: La altura total del contenido dentro del contenedor, incluyendo la parte que no es visible debido 
     *                      al scroll.
     *      - clientHeight: La altura visible del contenedor (es decir, la altura del área en la que se muestran los elementos 
     *                      sin desplazarse).
     *    - Si "scrollHeight" es mayor que "clientHeight", significa que hay más contenido dentro del contenedor del que puede 
     *      verse a simple vista, por lo que es necesario un scrollbar, y por ende se remueve la clase "no-scroll", cuyo
     *      proposito es ocultar el borde derecho de los elementos ".liResults" si el scrollbar no está presente. Entonces al 
     *      remover esta clase, se permite que los elementos ".liResults" mantengan el borde derecho visible.
     *    - Caso contrario, si no hay scrollbar (es decir, "scrollHeight" es menor o igual a "clientHeight"), se agrega la clase 
     *      "no-scroll" al contenedor para ocultar el borde derecho de los elementos ".liResults".
     * 2. Este "useEffect" se volvera a ejecutar cada vez que el array de resultados de busqueda "searchResults" cambie.  
  */ 
const useNoScroll = (dependencies) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (container.scrollHeight > container.clientHeight) {
        container.classList.remove('no-scroll');
      } else {
        container.classList.add('no-scroll');
      }
    }
  }, [dependencies]);

  return containerRef; // Retornamos la referencia para que pueda ser usada en el componente

};


export default useNoScroll;