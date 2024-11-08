import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiPlay, FiInfo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Movie {
    _id: string;
    title: string;
    poster: string;
    backdrop: string;
    overview: string;
    year: number;
    rating: number;
    genres: string[];
    quality: string;
}

interface TVSeries extends Movie {
    numberOfSeasons: number;
}

interface HeroSliderProps {
    latestMovies: Movie[];
    latestTVSeries: TVSeries[];
    popularMovies: Movie[];
    popularTVSeries: TVSeries[];
    featuredContent: (Movie | TVSeries)[];
}

// Add this type
type SliderRef = {
    slickNext(): void;
    slickPrev(): void;
    slickPlay(): void;
    slickPause(): void;
    slickGoTo(slideNumber: number): void;
};

export default function HeroSlider({
    latestMovies,
    latestTVSeries,
    popularMovies,
    popularTVSeries,
    featuredContent
}: HeroSliderProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const sliderRef = useRef<SliderRef>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    // Combine all content for slider
    const sliderContent = [
        ...latestMovies.slice(0, 2),
        ...latestTVSeries.slice(0, 2),
        ...popularMovies.slice(0, 2),
        ...popularTVSeries.slice(0, 2),
        ...featuredContent.slice(0, 4)
    ];

    // Preload current and next slide images
    useEffect(() => {
        const preloadImage = (src: string) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });
        };

        const preloadSlideImages = async (index: number) => {
            const content = sliderContent[index];
            if (content && !loadedImages.has(content._id)) {
                await Promise.all([
                    preloadImage(content.backdrop || content.poster),
                    preloadImage(content.poster)
                ]);
                setLoadedImages(prev => new Set(prev).add(content._id));
            }

            // Preload next slide
            const nextIndex = (index + 1) % sliderContent.length;
            const nextContent = sliderContent[nextIndex];
            if (nextContent && !loadedImages.has(nextContent._id)) {
                Promise.all([
                    preloadImage(nextContent.backdrop || nextContent.poster),
                    preloadImage(nextContent.poster)
                ]);
            }
        };

        if (sliderContent.length > 0) {
            preloadSlideImages(activeSlide);
        }
    }, [activeSlide, sliderContent]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        beforeChange: (current: number, next: number) => {
            setActiveSlide(next);
        },
        customPaging: (i: number) => (
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeSlide ? 'bg-purple-500 w-8' : 'bg-gray-500 hover:bg-gray-400'
                }`} />
        ),
        dotsClass: "slick-dots !flex items-center justify-center gap-2 !bottom-6",
        arrows: false,
    };

    const isMovie = (content: Movie | TVSeries): content is Movie => {
        return !('numberOfSeasons' in content);
    };

    const isTVSeries = (content: Movie | TVSeries): content is TVSeries => {
        return 'numberOfSeasons' in content;
    };

    if (sliderContent.length === 0) {
        return null;
    }

    return (
        <div
            className="relative h-[65vh] md:h-[75vh] lg:h-[85vh] mb-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Slider ref={sliderRef} {...settings} className="h-full">
                {sliderContent.map((content, index) => (
                    <div key={content._id} className="relative h-[65vh] md:h-[75vh] lg:h-[85vh]">
                        {/* Show loading state for unloaded images */}
                        {!loadedImages.has(content._id) ? (
                            <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                {/* Backdrop Image with Enhanced Gradient */}
                                <div className="absolute inset-0">
                                    <img
                                        src={content.backdrop || content.poster}
                                        alt={content.title}
                                        className="w-full h-full object-cover"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 h-full flex items-center">
                                    <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-6 md:gap-12 pt-20 md:pt-0">
                                        {/* Poster with Animation */}
                                        <div className="w-48 md:w-64 lg:w-72 flex-shrink-0 transform hover:scale-105 transition-all duration-500">
                                            <div className="relative group rounded-lg overflow-hidden shadow-2xl">
                                                <img
                                                    src={content.poster}
                                                    alt={content.title}
                                                    className="w-full h-auto rounded-lg transform transition-transform duration-500 group-hover:scale-110"
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                                    <Link
                                                        href={`/${isMovie(content) ? 'movies' : 'tv-series'}/${content._id}`}
                                                        className="bg-purple-600/90 hover:bg-purple-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-sm md:text-base"
                                                    >
                                                        <FiInfo className="w-4 h-4" />
                                                        <span>View Details</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info with Enhanced Animation */}
                                        <div className="flex-1 text-white max-w-2xl text-center md:text-left transform transition-all duration-500 translate-y-0">
                                            <Link
                                                href={`/${isMovie(content) ? 'movies' : 'tv-series'}/${content._id}`}
                                                className="group inline-block"
                                            >
                                                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight group-hover:text-purple-400 transition-colors duration-300">
                                                    {content.title}
                                                </h1>
                                            </Link>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm md:text-base mb-4">
                                                <span className="bg-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full border border-purple-500/30">
                                                    {content.year}
                                                </span>
                                                <span className="flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full border border-yellow-500/30">
                                                    <span className="mr-1">⭐</span>
                                                    {content.rating}
                                                </span>
                                                <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/30">
                                                    {content.quality}
                                                </span>
                                                {isTVSeries(content) && (
                                                    <span className="bg-pink-500/20 text-pink-400 px-4 py-1.5 rounded-full border border-pink-500/30">
                                                        {content.numberOfSeasons} Seasons
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-4 hidden md:block">
                                                <p className="text-gray-400 text-sm md:text-base">{content.genres.join(' • ')}</p>
                                            </div>
                                            <p className="text-gray-300 mb-6 line-clamp-2 md:line-clamp-3 text-sm md:text-base leading-relaxed">
                                                {content.overview}
                                            </p>
                                            <Link
                                                href={`/${isMovie(content) ? 'movies' : 'tv-series'}/${content._id}`}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-sm md:text-base font-medium transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                                            >
                                                <FiPlay className="w-4 h-4" />
                                                <span>More Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </Slider>

            {/* Enhanced Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => sliderRef.current?.slickPrev()}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto hover:bg-black/70 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                >
                    <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => sliderRef.current?.slickNext()}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto hover:bg-black/70 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                >
                    <FiChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
} 