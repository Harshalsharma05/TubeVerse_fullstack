import { useState, useEffect } from 'react';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const LikedVideos = () => {
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/likes/videos');
                // The backend returns an array of { video, likedBy }
                setLikedVideos(response.data.data.map(item => item.video));
            } catch (error) {
                toast.error('Failed to fetch liked videos');
            } finally {
                setLoading(false);
            }
        };
        fetchLikedVideos();
    }, []);

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Liked Videos</h1>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : likedVideos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't liked any videos yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {likedVideos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedVideos;
