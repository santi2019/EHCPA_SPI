import { useState, useEffect, useRef } from 'react';


const useMouseOverComponent = () => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const handleMouseEnter = () => setIsMouseOver(true);
        const handleMouseLeave = () => setIsMouseOver(false);

        const element = elementRef.current;
        if (element) {
            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (element) {
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [elementRef]);

    return { isMouseOver, elementRef };
};

export default useMouseOverComponent;
