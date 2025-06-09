import { useState, useEffect } from 'react';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const MyContent = () => {
    const [userVideos, setUserVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserVideos = async () => {
            try {
                setLoading(true);
                // Assuming /dashboard/videos returns the logged-in user's videos
                const response = await axios.get('/dashboard/videos');
                setUserVideos(response.data.data);
            } catch (error) {
                toast.error('Failed to fetch your videos');
            } finally {
                setLoading(false);
            }
        };
        fetchUserVideos();
    }, []);

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Content</h1>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : userVideos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't uploaded any videos yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userVideos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyContent;
