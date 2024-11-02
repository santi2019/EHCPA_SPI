import { useEffect, useRef } from 'react';

/*******************************************************************************************************************************************************/

/**
 * Hook useNoScroll: Sirve para quitar los bordes derechos de cualquier elmento dinamico referenciado, en caso de que el scroll-bar no este activado.
 * 1. La funcion recibe como parametro la variable "dependencies" la cual permite especificar los elementos que, al cambiar, desencadenarán la ejecución 
 *    del "useEffect", lo que permite que el contenedor, en el que se encuentran dichos elementos, actualice la clase CSS "no-scroll" en función de si 
 *    necesita un scroll-bar o no. 
 * 2. El siguiente "useEffect" se utiliza para eliminar el borde derecho de un elemento referenciadp en caso de que no tenga el scroll-bar. El mismo
 *    Verifica si el elemento o contenedor tiene mas contenido del que puede mostrarse a la vez (es decir, si tiene un scrollbar) y, dependiendo de eso, 
 *    se ajusta la clase CSS del contenedor.
 * 3. Previamente, creamos una referencia del contenedor para que pueda ser asignado.
 * 4. Dentro de "useEffect" verificamos si el contendor existe, y si es asi, verificamos si el contenido del contenedor es mayor que el área visible del 
 *    contenedor mismo. Para ello, se comparan dos propiedades:
 *    - scrollHeight: La altura total del contenido dentro del contenedor, incluyendo la parte que no es visible debido al scroll-bar.
 *    - clientHeight: La altura visible del contenedor (es decir, la altura del área en la que se muestran los elementos sin desplazarse).
 *    Entonces, se verifica que:
 *    - Si "scrollHeight" es mayor que "clientHeight", significa que hay más contenido dentro del contenedor del que puede verse a simple vista, por lo 
 *      que es necesario un scroll-bar, y por ende se remueve la clase "no-scroll", cuyo proposito es ocultar el borde derecho de los elementos "li" si 
 *      el scroll-bar no está presente. Entonces, al remover esta clase, se permite que los elementos "li" mantengan el borde derecho visible.
 *   - Caso contrario, si no hay scroll-bar (es decir, "scrollHeight" es menor o igual a "clientHeight"), se agrega la clase "no-scroll" al contenedor 
 *     para ocultar el borde derecho de los elementos "li" del mismo.
 * 5. Este "useEffect" se volvera a ejecutar cada vez que el array de resultados de busqueda "searchResults" cambie.
 * 6. Por ultimo, se exporta "useNoScroll" como componente.
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