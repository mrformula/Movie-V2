declare module 'react-slick' {
    import { ComponentType, RefObject } from 'react';

    interface SliderSettings {
        dots?: boolean;
        infinite?: boolean;
        speed?: number;
        slidesToShow?: number;
        slidesToScroll?: number;
        autoplay?: boolean;
        autoplaySpeed?: number;
        fade?: boolean;
        cssEase?: string;
        beforeChange?: (current: number, next: number) => void;
        customPaging?: (i: number) => JSX.Element;
        dotsClass?: string;
        arrows?: boolean;
    }

    interface SliderProps extends SliderSettings {
        children?: React.ReactNode;
        className?: string;
        ref?: RefObject<any>;
    }

    const Slider: ComponentType<SliderProps>;
    export default Slider;
} 