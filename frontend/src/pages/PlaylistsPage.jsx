import React, { useEffect, useState } from "react";
import axios from '../config/axios';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Lock, Globe, MoreVertical, Edit3, Trash2, X } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PlaylistsPage = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", isPublic: true });
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user) {
        try {
          const res = await axios.get(`/playlist/user/${user._id}`);
          setPlaylists(res.data.data || []);
        } catch (error) {
          console.error('Error fetching playlists:', error);
          setPlaylists([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlaylists();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/playlist/", form);
      setShowCreate(false);
      setForm({ name: "", description: "", isPublic: true });
      
      // Refresh playlists
      const res = await axios.get(`/playlist/user/${user._id}`);
      setPlaylists(res.data.data || []);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDelete = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await axios.delete(`/playlist/${playlistId}`);
        setPlaylists(playlists.filter(pl => pl._id !== playlistId));
        setShowMenu(null);
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  const getPlaylistThumbnail = (playlist) => {
    if (playlist.videos && playlist.videos.length > 0) {
      return playlist.videos[0].thumbnail;
    }
    return null;
  };

  const getVideoCount = (playlist) => {
    return playlist.videos ? playlist.videos.length : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto my-12 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Playlists</h1>
            <p className="text-gray-600">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setShowCreate(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Create Playlist
          </button>
        </div>

        {/* Create Playlist Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Playlist</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter playlist name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Tell viewers about your playlist"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Privacy
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={form.isPublic}
                        onChange={() => setForm(f => ({ ...f, isPublic: true }))}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <Globe size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Public - Anyone can view</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!form.isPublic}
                        onChange={() => setForm(f => ({ ...f, isPublic: false }))}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <Lock size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Private - Only you can view</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Playlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setForm({ name: "", description: "", isPublic: true });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
              >
                {/* Playlist Thumbnail */}
                <div
                  className="relative aspect-video bg-gradient-to-br from-red-100 to-red-200"
                  onClick={() => navigate(`/playlists/${playlist._id}`)}
                >
                  {getPlaylistThumbnail(playlist) ? (
                    <img
                      src={getPlaylistThumbnail(playlist)}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={48} className="text-red-400" />
                    </div>
                  )}
                  
                  {/* Video count overlay */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {getVideoCount(playlist)} video{getVideoCount(playlist) !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={48} className="text-white" />
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="font-semibold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors cursor-pointer flex-1"
                      onClick={() => navigate(`/playlists/${playlist._id}`)}
                    >
                      {playlist.name}
                    </h3>
                    
                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === playlist._id ? null : playlist._id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showMenu === playlist._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add edit functionality here
                              setShowMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(playlist._id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {playlist.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {playlist.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {playlist.isPublic ? (
                      <Globe size={12} />
                    ) : (
                      <Lock size={12} />
                    )}
                    <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
                    <span>•</span>
                    <span>
                      {playlist.updatedAt 
                        ? formatDistanceToNow(parseISO(playlist.updatedAt), { addSuffix: true })
                        : 'Recently updated'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-12 inline-block shadow-sm">
              <Play size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No playlists yet</h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Create your first playlist to organize your favorite videos and share them with others.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Create Your First Playlist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  );
};

export default PlaylistsPage;