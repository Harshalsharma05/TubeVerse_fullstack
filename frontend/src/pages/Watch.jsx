import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import { 
    ThumbsUp, 
    ThumbsDown, 
    Share2, 
    MessageCircle,
    Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Watch = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [comments, setComments] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    // const [hasUpdatedView, setHasUpdatedView] = useState(false);

    const fetchSubscriberCount = async (channelId) => {
        try {
            const response = await axios.get(`/subscriptions/u/${channelId}`);
            setSubscriberCount(response.data.data.subscriberCount?.subscribersCount || 0);
        } catch (error) {
            console.error('Error fetching subscriber count:', error);
        }
    };

    // Check subscription status using localStorage as backup and making a test call
    const checkSubscriptionStatus = async (channelId) => {
        try {
            // First check localStorage for the subscription status
            const storedStatus = localStorage.getItem(`subscription_${channelId}`);
            if (storedStatus !== null) {
                const isStoredSubscribed = JSON.parse(storedStatus);
                setIsSubscribed(isStoredSubscribed);
                return;
            }

            // If not in localStorage, we can try to determine it by making a controlled test
            // Since we don't have a direct endpoint, we'll assume not subscribed initially
            // The real status will be determined after the first toggle action
            setIsSubscribed(false);
            
        } catch (error) {
            console.error('Error checking subscription status:', error);
            setIsSubscribed(false);
        }
    };

    const fetchLikeCount = async () => {
        try {
            const response = await axios.get(`/likes/count/v/${videoId}`);
            setLikeCount(response.data.data.totalLikes);
        } catch (error) {
            console.error('Error fetching like count:', error);
        }
    };

    const updateWatchHistoryAndViews = async () => {
        try {
            // Add to watch history (backend deduplicates)
            await axios.patch(`/videos/${videoId}/views`);

            // Increment views (backend only increments if not already watched)
            const res = await axios.patch(`/videos/${videoId}/views`, {}, { withCredentials: true });
            console.log('View count response:', res.data);
        } catch (error) {
            console.error('Error updating watch history and views:', error);
        }
    };

    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setLoading(true);
                // Fetch video details
                const videoResponse = await axios.get(`/videos/${videoId}`);
                const videoData = videoResponse.data.data;
                setVideo(videoData);
                
                // Always call this, backend will deduplicate
                await updateWatchHistoryAndViews();

                // Fetch subscriber count for the video owner
                if (videoData?.owner?._id) {
                    await fetchSubscriberCount(videoData.owner._id);
                    // Check subscription status for the video owner
                    await checkSubscriptionStatus(videoData.owner._id);
                }

                // Fetch like count
                await fetchLikeCount();

                // Fetch related videos
                const relatedResponse = await axios.get('/videos', {
                    params: {
                        limit: 15,
                        exclude: videoId
                    }
                });
                setRelatedVideos(relatedResponse.data.data);

                // Fetch video comments
                const commentsResponse = await axios.get(`/comments/${videoId}`);
                setComments(commentsResponse.data.data);

            } catch (error) {
                console.error('Error fetching video data:', error);
                toast.error('Failed to load video');
            } finally {
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [videoId]);

    const handleLike = async () => {
        try {
            await axios.post(`/likes/toggle/v/${videoId}`);
            // Refresh like count
            await fetchLikeCount();
            toast.success('Like updated successfully');
        } catch (error) {
            toast.error('Failed to update like');
        }
    };

    const handleSubscribe = async () => {
        if (!video?.owner?._id) {
            toast.error('Channel information not available');
            return;
        }
        try {
            const response = await axios.post(`/subscriptions/c/${video.owner._id}`);
            
            // Get the subscription status from the response
            const newSubscriptionStatus = response.data.data.isSubscribed;
            setIsSubscribed(newSubscriptionStatus);
            
            // Store the subscription status in localStorage for persistence
            localStorage.setItem(`subscription_${video.owner._id}`, JSON.stringify(newSubscriptionStatus));
            
            // Refresh subscriber count to show updated count
            await fetchSubscriberCount(video.owner._id);
            
            toast.success(newSubscriptionStatus ? 'Subscribed successfully' : 'Unsubscribed successfully');
        } catch (error) {
            toast.error('Failed to update subscription');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await axios.post(`/comments/${videoId}`, {
                content: commentText
            });
            // Refresh comments
            const response = await axios.get(`/comments/${videoId}`);
            setComments(response.data.data);
            setCommentText('');
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto my-12 px-4 py-6 flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="lg:w-[calc(100%-384px)]">
                {/* Video Player */}
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                        src={video?.videoFile}
                        poster={video?.thumbnail}
                        controls
                        className="w-full h-full"
                    />
                </div>

                {/* Video Info */}
                <div className="mt-4">
                    <h1 className="text-xl font-bold">{video?.title}</h1>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                            <img
                                src={video?.owner?.avatar}
                                alt={video?.owner?.username}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h3 className="font-medium">{video?.owner?.username}</h3>
                                <p className="text-sm text-gray-600">{subscriberCount} subscribers</p>
                            </div>
                            <button
                                onClick={handleSubscribe}
                                className={`ml-4 px-4 py-2 rounded-full font-medium ${
                                    isSubscribed
                                        ? 'bg-gray-100 hover:bg-gray-200'
                                        : 'bg-black text-white hover:bg-gray-800'
                                }`}
                            >
                                {isSubscribed ? (
                                    <div className="flex items-center gap-2">
                                        <Bell size={20} />
                                        Subscribed
                                    </div>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <ThumbsUp size={20} />
                                {likeCount}
                            </button>
                            <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <ThumbsDown size={20} />
                            </button>
                            <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                <Share2 size={20} />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Video Description */}
                    <div className="mt-4 bg-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{video?.views?.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{new Date(video?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{video?.description}</p>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">
                            {comments.length} Comments
                        </h3>
                        
                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-6">
                            <img
                                src={video?.owner?.avatar}
                                alt="Current user"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full px-4 py-2 border-b focus:border-b-2 focus:border-blue-500 outline-none"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCommentText('')}
                                        className="px-4 py-2 rounded-full hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-4">
                                    <img
                                        src={comment.createdBy?.avatar}
                                        alt={comment.createdBy?.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{comment.createdBy?.username}</h4>
                                            <span className="text-sm text-gray-600">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p>{comment.content}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full">
                                                <ThumbsUp size={16} />
                                                {comment.likes || 0}
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <ThumbsDown size={16} />
                                            </button>
                                            <button className="px-4 py-2 hover:bg-gray-100 rounded-full text-sm">
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar - Related Videos */}
            <div className="lg:w-96 space-y-4">
                {relatedVideos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default Watch;