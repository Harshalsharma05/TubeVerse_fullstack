import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { Bell, BellOff } from 'lucide-react';

const Subscriptions = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            // Get current user from localStorage or context
            // Ensure the user object is retrieved safely
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            
            if (!user?._id) {
                toast.error('User not logged in or user ID not found. Please log in.');
                setLoading(false);
                return;
            }
            const response = await axios.get(`/subscriptions/c/${user._id}`);
            // Ensure that `subscribedChannels` array is filtered to only include valid channelDetails
            setChannels(response.data.data.subscribedChannels?.filter(item => item.channelDetails) || []);
        } catch (error) {
            console.error("Error fetching subscriptions: ", error);
            toast.error(error.response?.data?.message || 'Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
        // eslint-disable-next-line
    }, []);

    const handleToggleSubscription = async (channelId) => {
        try {
            await axios.post(`/subscriptions/c/${channelId}`);
            toast.success('Subscription updated');
            fetchSubscriptions(); // Re-fetch to update the list
        } catch (error) {
            console.error("Error toggling subscription: ", error);
            toast.error(error.response?.data?.message || 'Failed to update subscription');
        }
    };

    return (
        <div className="container mx-auto my-12 px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Subscriptions</h1>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : channels.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't subscribed to any channels yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {channels.map((item) => {
                        // Add this null/undefined check for channelDetails
                        // if (!item.channelDetails) return null; 

                        const channel = item.channelDetails;
                        return (
                            <div key={channel._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                                <Link to={`/channel/${channel.username}`} className="flex flex-col items-center">
                                    <img
                                        src={channel.avatar || 'https://placehold.co/100x100/gray/white?text=User'}
                                        alt={channel.username || 'User'}
                                        className="w-20 h-20 rounded-full mb-2 object-cover"
                                    />
                                    <h2 className="text-lg font-semibold">{channel.fullName || 'Unknown User'}</h2>
                                    <p className="text-gray-600">@{channel.username || 'unknown'}</p>
                                </Link>
                                <button
                                    onClick={() => handleToggleSubscription(channel._id)}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600"
                                >
                                    <BellOff size={18} />
                                    Unsubscribe
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
