import { useState, useEffect } from 'react';
import axios from '../config/axios';
import VideoCard from '../components/common/VideoCard';
import toast from 'react-hot-toast';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Watch History</h1>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't watched any videos yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {history.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
