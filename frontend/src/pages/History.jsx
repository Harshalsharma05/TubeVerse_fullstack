import { useState, useEffect } from 'react';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import { Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showClearModal, setShowClearModal] = useState(false);
    const [deletingVideoId, setDeletingVideoId] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/users/history');
                setHistory(response.data.data || []);
            } catch (error) {
                toast.error('Failed to fetch watch history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleClearAllHistory = async () => {
        try {
            await axios.patch('/users/history/clear');
            setHistory([]);
            setShowClearModal(false);
            toast.success('Watch history cleared successfully');
        } catch (error) {
            toast.error('Failed to clear watch history');
        }
    };

    const handleRemoveVideo = async (videoId) => {
        try {
            setDeletingVideoId(videoId);
            await axios.delete(`/users/history/${videoId}/clear`);
            setHistory(prev => prev.filter(video => video._id !== videoId));
            toast.success('Video removed from history');
        } catch (error) {
            toast.error('Failed to remove video from history');
        } finally {
            setDeletingVideoId(null);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto my-12 px-4 py-8">
                <div className="text-center py-8">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            {/* Header with Clear All Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Watch History</h1>
                {history.length > 0 && (
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={20} />
                        Clear All History
                    </button>
                )}
            </div>

            {/* Content */}
            {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't watched any videos yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {history.map((video) => (
                        <div key={video._id} className="relative group">
                            <VideoCard video={video} />
                            {/* Remove Button Overlay */}
                            <button
                                onClick={() => handleRemoveVideo(video._id)}
                                disabled={deletingVideoId === video._id}
                                className="absolute top-2 bg-black bg-opacity-70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90 disabled:opacity-50"
                                title="Remove from history"
                            >
                                {deletingVideoId === video._id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <X size={16} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Clear Watch History</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to clear your entire watch history? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllHistory}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;