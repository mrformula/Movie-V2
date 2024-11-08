import { useRef } from 'react';
import { FiPlay, FiDownload } from 'react-icons/fi';

interface Props {
    embedCode: string;
    title: string;
}

export default function VideoPlayer({ embedCode, title }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const getEmbedUrl = (code: string) => {
        const videoId = code.replace('https://hlswish.com/', '')
            .replace('https://hlswish.com/e/', '')
            .replace('https://embedwish.com/e/', '')
            .replace('https://embedwish.com/', '')
            .replace('/e/', '')
            .replace('e/', '');

        return `https://hlswish.com/e/${videoId}`;
    };

    return (
        <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
                <iframe
                    ref={iframeRef}
                    src={getEmbedUrl(embedCode)}
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}
                />
            </div>
        </div>
    );
} 