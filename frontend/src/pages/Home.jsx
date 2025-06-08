import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const VIDEOS_PER_PAGE = 12;

const Home = () => {
    const [searchParams] = useSearchParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            const query = searchParams.get('query') || '';
            
            const response = await axios.get('/videos', {
                params: {
                    page: currentPage,
                    limit: VIDEOS_PER_PAGE,
                    query: query,
                    sortBy: "createdAt",
                    sortType: "desc"
                }
            });

            const newVideos = response.data.data;
            
            if (reset) {
                setVideos(newVideos);
            } else {
                setVideos(prev => [...prev, ...newVideos]);
            }
            
            setHasMore(newVideos.length === VIDEOS_PER_PAGE);
            setPage(currentPage + 1);
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch videos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(true);
    }, [searchParams]);

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => fetchVideos()}
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}

            {/* No Videos Message */}
            {!loading && videos.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No videos found. Try a different search.
                </div>
            )}
        </div>
    );
};

export default Home;
