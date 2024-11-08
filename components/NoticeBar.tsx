import { FiInfo, FiAlertTriangle, FiCheckCircle, FiSend, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface NoticeBarProps {
    text: string;
    type: 'info' | 'warning' | 'success' | 'telegram' | 'join' | 'update' | 'event';
    link?: string;
    buttonText?: string;
    bgColor?: string;
    textColor?: string;
    buttonColor?: string;
}

const NoticeBar: React.FC<NoticeBarProps> = ({
    text,
    type,
    link,
    buttonText,
    bgColor,
    textColor,
    buttonColor
}) => {
    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5" />;
            case 'success':
                return <FiCheckCircle className="w-5 h-5" />;
            case 'telegram':
                return <FiSend className="w-5 h-5" />;
            case 'join':
                return <FiSend className="w-5 h-5 animate-bounce" />;
            case 'update':
                return <FiInfo className="w-5 h-5 animate-pulse" />;
            case 'event':
                return <FiInfo className="w-5 h-5 animate-spin" />;
            default:
                return <FiInfo className="w-5 h-5" />;
        }
    };

    const getDefaultStyles = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-500 bg-opacity-10 text-yellow-500';
            case 'success':
                return 'bg-green-500 bg-opacity-10 text-green-500';
            case 'telegram':
                return 'bg-blue-500 bg-opacity-10 text-blue-500';
            case 'join':
                return 'bg-purple-500 bg-opacity-10 text-purple-500';
            case 'update':
                return 'bg-pink-500 bg-opacity-10 text-pink-500';
            case 'event':
                return 'bg-indigo-500 bg-opacity-10 text-indigo-500';
            default:
                return 'bg-purple-500 bg-opacity-10 text-purple-500';
        }
    };

    const getButtonStyles = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'success':
                return 'bg-green-500 hover:bg-green-600';
            case 'telegram':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'join':
                return 'bg-purple-500 hover:bg-purple-600';
            case 'update':
                return 'bg-pink-500 hover:bg-pink-600';
            case 'event':
                return 'bg-indigo-500 hover:bg-indigo-600';
            default:
                return 'bg-purple-500 hover:bg-purple-600';
        }
    };

    const content = (
        <div
            className={`py-2 md:py-3 px-3 md:px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 ${bgColor ? '' : getDefaultStyles()}`}
            style={{
                backgroundColor: bgColor || '',
                color: textColor || ''
            }}
        >
            <div className="flex items-center gap-2 text-xs md:text-sm text-center md:text-left">
                {getIcon()}
                <span className="font-medium line-clamp-2 md:line-clamp-1">{text}</span>
            </div>
            {link && buttonText && (
                <button
                    className={`${buttonColor ? '' : getButtonStyles()} 
                        text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium 
                        flex items-center gap-1 md:gap-2 transition-all duration-300 hover:scale-105 whitespace-nowrap
                    `}
                    style={{
                        backgroundColor: buttonColor || ''
                    }}
                >
                    {buttonText}
                    <FiArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
            )}
        </div>
    );

    return link ? (
        <Link href={link} className="block hover:opacity-95 transition-opacity">
            {content}
        </Link>
    ) : content;
};

export default NoticeBar; 