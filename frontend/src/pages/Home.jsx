import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VIDEOS_PER_PAGE = 12;

const Home = () => {
    const [searchParams] = useSearchParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const { user } = useAuth();

    // Fetch user playlists
    const fetchPlaylists = async () => {
        try {
            // Get user ID from AuthContext
            if (!user?._id) {
                console.log('No user found, skipping playlist fetch');
                return;
            }

            const response = await axios.get(`/playlist/user/${user._id}`);
            
            // Handle different possible response structures
            const playlistData = response.data.data || response.data.playlists || response.data || [];
            setPlaylists(playlistData);
            
        } catch (error) {
            console.error('Error fetching playlists:', error);
            // Don't show toast error for playlists as it's not critical
            setPlaylists([]);
        }
    };

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

    // Handle adding video to playlist
    const handleAddToPlaylist = async (videoId, playlistId) => {
        try {
            // Adjust the endpoint based on your backend API
            const response = await axios.patch(`/playlist/add/${videoId}/${playlistId}`, {
                playlistId: playlistId,
                videoId: videoId
            });
            
            if (response.status === 200 || response.status === 201) {
                toast.success('Video added to playlist successfully!');
            }
        } catch (error) {
            console.error('Error adding video to playlist:', error);
            toast.error(error.response?.data?.message || 'Failed to add video to playlist');
        }
    };

    useEffect(() => {
        fetchVideos(true);
        // Fetch playlists when component mounts and user is available
        if (user?._id) {
            fetchPlaylists();
        }
    }, [searchParams, user]);

    // Fetch playlists when user changes (login/logout)
    useEffect(() => {
        if (user?._id) {
            fetchPlaylists();
        } else {
            setPlaylists([]); // Clear playlists when user logs out
        }
    }, [user]);

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <VideoCard 
                        key={video._id} 
                        video={video} 
                        playlists={playlists}
                        onAddToPlaylist={handleAddToPlaylist}
                    />
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