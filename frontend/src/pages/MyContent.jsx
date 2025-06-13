import { useState, useEffect } from 'react';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const MyContent = () => {
    const [userVideos, setUserVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingVideoId, setDeletingVideoId] = useState(null);

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

    const handleDeleteVideo = async (videoId) => {
        // Show confirmation dialog
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this video? This action cannot be undone.'
        );
        
        if (!confirmDelete) {
            return;
        }

        try {
            setDeletingVideoId(videoId);
            await axios.delete(`/videos/${videoId}`);
            
            // Remove the deleted video from the state
            setUserVideos(prevVideos => 
                prevVideos.filter(video => video.id !== videoId)
            );
            
            toast.success('Video deleted successfully');
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Failed to delete video. Please try again.');
        } finally {
            setDeletingVideoId(null);
        }
    };

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Content</h1>
            
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-lg">Loading...</p>
                </div>
            ) : userVideos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">You haven't uploaded any videos yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userVideos.map((video) => (
                        <div key={video.id} className="relative">
                            <VideoCard video={video} />
                            <button
                                onClick={() => handleDeleteVideo(video.id)}
                                disabled={deletingVideoId === video.id}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                                title="Delete video"
                            >
                                {deletingVideoId === video.id ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyContent;