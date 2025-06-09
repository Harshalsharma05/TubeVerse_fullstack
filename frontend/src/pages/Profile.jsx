import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const Profile = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [channelData, setChannelData] = useState(null);
    const [channelStats, setChannelStats] = useState(null);
    const [userVideos, setUserVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                setLoading(true);

                // Always fetch the channel profile by username in URL
                const profileResponse = await axios.get(`/users/channel/${username}`);
                setChannelData(profileResponse.data.data);

                // If viewing your own profile, fetch stats and videos from dashboard endpoints
                if (user && username === user.username) {
                    const statsResponse = await axios.get('/dashboard/stats');
                    setChannelStats(statsResponse.data.data);

                    const videosResponse = await axios.get('/dashboard/videos');
                    setUserVideos(videosResponse.data.data);
                } else {
                    // For other users, use public endpoints
                    // You may need to create a backend endpoint to get videos by userId
                    const userId = profileResponse.data.data._id;
                    // Example: /videos?userId=...
                    const videosResponse = await axios.get(`/public/videos/${userId}`);
                    setUserVideos(videosResponse.data.data.video);

                    // For stats, use the data from the profile response if available,
                    // or create a public stats endpoint if needed.
                    setChannelStats({
                        totalSubscribers: profileResponse.data.data.totalSubscribers,
                        totalVideos: videosResponse.data.data.video.length,
                        totalViews: videosResponse.data.data.video.reduce((sum, v) => sum + (v.views || 0), 0),
                        totalLikes: videosResponse.data.data.totalLikes // You may need a public endpoint for this
                    });
                }
            } catch (error) {
                console.error('Error fetching channel data:', error);
                toast.error('Failed to load channel data');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchChannelData();
        }
    }, [username, user, navigate]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto my-10 px-4 py-8">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
                <img
                    src={channelData?.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="flex-shrink-0">
                    <img
                        src={channelData?.avatar}
                        alt={channelData?.username}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                    />
                </div>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold">{channelData?.fullName}</h1>
                    <p className="text-gray-600">@{channelData?.username}</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold">{channelStats?.totalSubscribers ?? channelData?.subscribersCount}</h3>
                            <p className="text-gray-600">Subscribers</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold">{channelStats?.totalVideos}</h3>
                            <p className="text-gray-600">Videos</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold">{channelStats?.totalViews}</h3>
                            <p className="text-gray-600">Total Views</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold">{channelStats?.totalLikes ?? '-'}</h3>
                            <p className="text-gray-600">Total Likes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos Grid */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Uploaded Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userVideos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
                {userVideos.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No videos uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
