import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';

const VideoCard = ({ video, isHorizontal = false, playlists = [], onAddToPlaylist }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState(playlists);
    const { user } = useAuth();

    // Fetch user playlists if not provided
    useEffect(() => {
        const fetchUserPlaylists = async () => {
            try {
                // Get user ID from AuthContext
                if (!user?._id) {
                    console.log('No user found, skipping playlist fetch');
                    return;
                }
                
                const response = await axios.get(`/playlist/user/${user._id}`);
                
                // Handle the response data structure
                const data = response.data;
                setUserPlaylists(data.data || data.playlists || data || []);
            } catch (error) {
                console.error('Error fetching playlists:', error);
                setUserPlaylists([]);
            }
        };

        // Only fetch if playlists weren't provided as props and user exists
        if (playlists.length === 0 && user?._id) {
            fetchUserPlaylists();
        } else if (playlists.length > 0) {
            // Update userPlaylists when playlists prop changes
            setUserPlaylists(playlists);
        }
    }, [user?._id]); // FIXED: Removed playlists from dependencies

    // Separate useEffect to handle playlists prop changes
    useEffect(() => {
        if (playlists.length > 0) {
            setUserPlaylists(playlists);
        }
    }, [playlists]);

    // Format duration properly with proper padding
    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        seconds = Math.round(seconds);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            if (!dateString) return '';
            const date = parseISO(dateString);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        setShowMenu(false);
        if (onAddToPlaylist) {
            await onAddToPlaylist(video._id, playlistId);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && !event.target.closest('.menu-container')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    return (
        <div className="relative">
            <Link 
                to={`/watch/${video._id}`} 
                className={`flex ${isHorizontal ? 'flex-row gap-4' : 'flex-col'} group cursor-pointer`}
            >
                {/* Thumbnail */}
                <div className={`relative ${isHorizontal ? 'w-40' : 'w-full'} aspect-video rounded-xl overflow-hidden`}>
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                            e.target.src = '/default-thumbnail.jpg'; // Fallback image
                        }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                    </span>
                </div>

                {/* Video Info */}
                <div className={`flex ${isHorizontal ? 'flex-1' : ''} gap-2 mt-2`}>
                    {!isHorizontal && (
                        <img
                            src={video.createdBy?.avatar}
                            alt={video.createdBy?.username}
                            className="w-9 h-9 rounded-full"
                            onError={(e) => {
                                e.target.src = '/default-avatar.png'; // Fallback avatar
                            }}
                        />
                    )}
                    <div className="flex-1">
                        <h3 className="font-medium line-clamp-2 text-sm">
                            {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {video.createdBy?.fullName}
                        </p>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                            <span>{video.views?.toLocaleString()} views</span>
                            <span>•</span>
                            <span>
                                {formatDistanceToNow(parseISO(video.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
            
            {/* Add to Playlist Button/Menu */}
            <div className="absolute top-2 right-2 menu-container">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu((v) => !v);
                    }} 
                    className="bg-black/70 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                >
                    ⋮
                </button>
                
                {showMenu && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                        <div className="px-4 py-3 font-semibold text-gray-800 border-b border-gray-100">
                            Add to Playlist
                        </div>
                        
                        {userPlaylists.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                                No playlists found
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto">
                                {userPlaylists.map((playlist) => (
                                    <button
                                        key={playlist._id}
                                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddToPlaylist(playlist._id);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{playlist.name}</span>
                                            {playlist.videoCount && (
                                                <span className="text-gray-500 text-xs">
                                                    ({playlist.videoCount} videos)
                                                </span>
                                            )}
                                        </div>
                                        {playlist.description && (
                                            <div className="text-gray-400 text-xs mt-1 truncate">
                                                {playlist.description}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCard;