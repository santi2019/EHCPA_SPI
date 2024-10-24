import { useCallback  } from "react";


/** 
 * Hook useRippleEffect: Sirve para aplicar un efecto de tipo ripple (animacion circular) en el punto donde se hace click
 * sobre un boton o cualquier elmento interactivo. 
 * - Funcion createRipple: es la encargada de crear el efecto ripple, en donde la misma, recibe como parametro "event", que 
 *   es el evento del click capturado cuando justamente se hace hace click en un boton o cualquier elemento que dispare
 *   dicho evento. 
 *   El funcionamiento es el siguiente:
 *   1. Utilizamos useCallback para que createRipple solo se recree cuando sea necesario, mejorando la eficiencia del componente. 
 *   2. Se almacena en la variable button una referencia al elemento que disparo el evento de click, en donde currentTarget
 *      es el elemento al cual se le asigno el manejador de eventos (en este caso, el boton mediante onClick).
 *   3. Se almacena en la variable ripple la creaacion de un elemento de tipo span dinámicamente. Este span va a ser el círculo 
 *      que se expandira para crear el efecto ripple.
 *   4. Se almacena en la variable buttonProps las propiedades actuales (dimensiones, posicion, y demas) del boton en la pantalla 
 *      mediante "getBoundingClientRect()".
 *   5. Se almacena en la variable size el diametro que debe cubrir el efecto ripple, que en definitiva es el area del boton. Para 
 *      esto, se usa "Math.max()" para tomar el mayor valor entre el ancho y la altura del boton.
 *   6. Se calcula la posicion horizontal (x) del centro del ripple. Para esto se resta, la coordenada en x en relacion con la 
 *      ventana del navegador, con la medida del boton para obtener la posicion relativa del click dentro del mismo. Luego, restamos 
 *      la mitad del tamaño del ripple para centrarlo en el punto exacto del click.
 *   7. Se calcula la posicion vertical (y) del centro del ripple de igualmanera que para el eje horizontal.
 *   8. Establecemos las medidas del ripple, definimos el ancho y alto del ripple como un valor igual a size para que tenga una 
 *      forma circular. Se posiciona el ripple horizontal y verticalmente en el boton, y se añade la clase ".ripple".
 *   9. Mediante "appendChild()", el span que representa el ripple es añadido como un hijo del boton. Esto hace que el ripple se vea 
 *      dentro del boton, animandose desde el centro del click hacia afuera.
 *   10. Se agrega un listener al evento "animationend" del ripple, que es disparado cuando la animacion del mismo (definida en el CSS) 
 *       termina. Cuando la animacion termina, el span que contiene el ripple es eliminado.
 *   11. El componente solo se creara una vez cuando el componente se monte, y la funcion retorna "createRipple" que puede ser usadao 
 *       por cualquier componente que necesite aplicar el efecto.
 *   12. Por ultimo, se exporta "useRippleEffect" como componente.
*/
const useRippleEffect = () => {

    const createRipple = useCallback((event) => {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const buttonProps = button.getBoundingClientRect();
        const size = Math.max(buttonProps.width, buttonProps.height);
        const x = event.clientX - buttonProps.left - size / 2;
        const y = event.clientY - buttonProps.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }, []);

    return createRipple;

 };


export default useRippleEffect;
