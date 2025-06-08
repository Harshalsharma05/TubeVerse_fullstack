import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

const VideoCard = ({ video, isHorizontal = false }) => {
    // Format duration properly with proper padding
    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        seconds = Math.round(seconds);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            if (!dateString) return '';
            const date = parseISO(dateString);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    return (
        <Link 
            to={`/watch/${video._id}`} 
            className={`flex ${isHorizontal ? 'flex-row gap-4' : 'flex-col'} group cursor-pointer`}
        >
            {/* Thumbnail */}
            <div className={`relative ${isHorizontal ? 'w-40' : 'w-full'} aspect-video rounded-xl overflow-hidden`}>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                </span>
            </div>

            {/* Video Info */}
            <div className={`flex ${isHorizontal ? 'flex-1' : ''} gap-2 mt-2`}>
                {!isHorizontal && (
                    <img
                        src={video.createdBy?.avatar}
                        alt={video.createdBy?.username}
                        className="w-9 h-9 rounded-full"
                    />
                )}
                <div className="flex-1">
                    <h3 className="font-medium line-clamp-2 text-sm">
                        {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {video.createdBy?.fullName}
                    </p>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                        <span>{video.views?.toLocaleString()} views</span>
                        <span>•</span>
                        <span>
                            {formatDistanceToNow(parseISO(video.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;