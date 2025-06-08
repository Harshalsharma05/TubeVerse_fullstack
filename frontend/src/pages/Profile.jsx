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
                
                // If no username in params, use current user's username
                const channelUsername = username || user?.username;
                
                if (!channelUsername) {
                    toast.error('No channel specified');
                    navigate('/');
                    return;
                }

                // Fetch channel profile
                const profileResponse = await axios.get(`/users/channel/${channelUsername}`);
                setChannelData(profileResponse.data.data);

                // Only fetch stats if it's the current user's profile
                if (channelUsername === user?.username) {
                    const statsResponse = await axios.get('/dashboard/stats');
                    setChannelStats(statsResponse.data.data);
                }

                // Fetch user's videos
                const videosResponse = await axios.get('/dashboard/videos');
                setUserVideos(videosResponse.data.data);
            } catch (error) {
                console.error('Error fetching channel data:', error);
                toast.error('Failed to load channel data');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchChannelData();
    }, [username, user]);

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
                            <h3 className="text-2xl font-bold">{channelStats?.totalSubscribers}</h3>
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
                            <h3 className="text-2xl font-bold">{channelStats?.totalLikes}</h3>
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
