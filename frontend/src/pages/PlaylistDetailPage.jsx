import React, { useEffect, useState } from "react";
import axios from '../config/axios';
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Play, Clock, Eye, MoreVertical, Trash2, Edit3, Share, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [updating, setUpdating] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`/playlist/${playlistId}`);
        setPlaylist(res.data.data[0]);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const handleEdit = () => {
    if (!playlist) return;
    
    setEditForm({
      name: playlist.name,
      description: playlist.description || ""
    });
    setShowEdit(true);
    setShowMenu(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!playlist) return;

    // Validate form
    if (!editForm.name.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    if (!editForm.description.trim()) {
      toast.error('Playlist description is required');
      return;
    }

    setUpdating(true);
    try {
      const response = await axios.patch(`/playlist/${playlist._id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim()
      });

      // Update the playlist in the local state
      setPlaylist(prevPlaylist => ({
        ...prevPlaylist,
        ...response.data.data
      }));

      setShowEdit(false);
      setEditForm({ name: "", description: "" });
      toast.success('Playlist updated successfully!');
    } catch (error) {
      console.error('Error updating playlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update playlist';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setShowEdit(false);
    setEditForm({ name: "", description: "" });
  };

  const handleRemoveVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to remove this video from the playlist?')) {
      try {
        await axios.patch(`/playlist/remove/${videoId}/${playlistId}`);
        // Refresh playlist
        const res = await axios.get(`/playlist/${playlistId}`);
        setPlaylist(res.data.data[0]);
        toast.success('Video removed from playlist successfully!');
      } catch (error) {
        console.error('Error removing video:', error);
        toast.error(error.response?.data?.message || 'Failed to remove video');
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      try {
        await axios.delete(`/playlist/${playlistId}`);
        toast.success('Playlist deleted successfully!');
        navigate("/playlist");
      } catch (error) {
        console.error('Error deleting playlist:', error);
        toast.error(error.response?.data?.message || 'Failed to delete playlist');
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!playlist?.videos) return 0;
    return playlist.videos.reduce((total, video) => total + (video.duration || 0), 0);
  };

  const formatTotalDuration = () => {
    const totalSeconds = getTotalDuration();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Playlist not found</h2>
          <p className="text-gray-600 mb-4">The playlist you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/playlist')}
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 my-20">
      <div className="max-w-7xl mx-auto my-12 px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Playlist Info Sidebar */}
          <div className="lg:w-80 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-gradient-to-b from-red-500 to-red-600 rounded-xl p-6 text-white">
              {/* Playlist Thumbnail */}
              <div className="aspect-video bg-black/20 rounded-lg mb-4 relative overflow-hidden">
                {playlist.videos && playlist.videos.length > 0 ? (
                  <img 
                    src={playlist.videos[0]?.thumbnail} 
                    alt="Playlist thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/320/180';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={48} className="text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={48} className="cursor-pointer" />
                </div>
              </div>

              {/* Playlist Details */}
              <h1 className="text-2xl font-bold mb-2 line-clamp-2">{playlist.name}</h1>
              
              <div className="text-sm text-white/90 mb-4">
                <p className="mb-1">{playlist.createdBy.fullName || 'Unknown'}</p>
                <p className="mb-1">{playlist.videos?.length || 0} videos</p>
                <p className="mb-2">{formatTotalDuration()}</p>
                <p className="text-xs">
                  Updated {playlist.updatedAt ? formatDistanceToNow(parseISO(playlist.updatedAt), { addSuffix: true }) : 'recently'}
                </p>
              </div>

              {playlist.description && (
                <p className="text-sm text-white/90 mb-4 line-clamp-3">
                  {playlist.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button 
                  className="w-full bg-white text-red-600 py-2 px-4 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    if (playlist.videos && playlist.videos.length > 0) {
                      navigate(`/watch/${playlist.videos[0]._id}?list=${playlistId}`);
                    }
                  }}
                >
                  <Play size={18} />
                  Play all
                </button>
                
                <div className="relative z-50">
                  {/* Click outside to close menu */}
                  {showMenu && (
                    <div 
                      className="fixed inset-0 z-0" 
                      onClick={() => setShowMenu(false)}
                    />
                  )}
                  <button 
                    className="w-full bg-white/20 text-white py-2 px-4 rounded-full font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreVertical size={18} />
                    More actions
                  </button>
                  
                  {showMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                      >
                        <Edit3 size={16} />
                        Edit playlist
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Share clicked');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                      >
                        <Share size={16} />
                        Share playlist
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePlaylist();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video List */}
          <div className="flex-1">
            {playlist.videos && playlist.videos.length > 0 ? (
              <div className="space-y-1">
                {playlist.videos.map((video, index) => (
                  <div 
                    key={video._id}
                    className="bg-white rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex gap-4 p-3">
                      {/* Video Index */}
                      <div className="flex items-center justify-center w-8">
                        <span className="text-sm text-gray-500 group-hover:hidden">
                          {index + 1}
                        </span>
                        <Play 
                          size={16} 
                          className="text-gray-600 hidden group-hover:block cursor-pointer"
                          onClick={() => navigate(`/watch/${video._id}?list=${playlistId}&index=${index}`)}
                        />
                      </div>

                      {/* Video Thumbnail */}
                      <Link 
                        to={`/watch/${video._id}?list=${playlistId}&index=${index}`}
                        className="relative"
                      >
                        <div className="w-40 aspect-video rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/160/90';
                            }}
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                      </Link>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/watch/${video._id}?list=${playlistId}&index=${index}`}
                          className="block"
                        >
                          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-red-600 transition-colors mb-1">
                            {video.title}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {video.owner?.username || 'Unknown'}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{video.views?.toLocaleString() || 0} views</span>
                          </div>
                          <span>•</span>
                          <span>
                            {video.createdAt ? formatDistanceToNow(parseISO(video.createdAt), { addSuffix: true }) : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleRemoveVideo(video._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove from playlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <Play size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No videos in this playlist</h3>
                <p className="text-gray-600 mb-6">
                  Start building your playlist by adding videos you love.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  Browse videos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Playlist Modal */}
      {showEdit && playlist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Playlist</h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={updating}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter playlist name"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={updating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Tell viewers about your playlist"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                  disabled={updating}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Playlist'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={updating}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlaylistDetailPage;