import { Search, Upload, Menu, Bell, X, Play, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "../../config/axios.js"; // Update this path to your axios config file
import ytLogo from "../../assets/TubeVerse_logo_v2.png";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadClick = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/auth/login";
      return;
    }
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadData({
      title: "",
      description: "",
      videoFile: null,
      thumbnail: null
    });
    setUploadProgress(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setUploadData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadData.title || !uploadData.description) {
      alert("Please fill in title and description");
      return;
    }

    if (!uploadData.videoFile) {
      alert("Please select a video file");
      return;
    }

    if (!uploadData.thumbnail) {
      alert("Please select a thumbnail image");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("videoFile", uploadData.videoFile);
      formData.append("thumbnail", uploadData.thumbnail);

      const response = await axios.post("/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentComplete = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentComplete);
          }
        },
      });

      if (response.status === 200) {
        alert("Video uploaded successfully!");
        handleCloseModal();
        // Optionally redirect to the uploaded video or refresh the page
        window.location.reload();
      }

    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Upload failed";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu size={24} />
            </button>

            <Link to="/" className="flex items-center gap-0"> {/* Reduced gap here */}
              <img src={ytLogo} alt="TubeVerse Logo" className="h-14 w-auto align-middle" />

              <span className="text-3xl font-semibold tracking-tight text-gray-900">
                Tube<span className="text-red-600">Verse</span>
              </span>
            </Link>
          </div>



          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleUploadClick}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Upload Video"
            >
              <Upload size={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell size={24} />
            </button>
            {user ? (
              <Link
                to={`/channel/${user.username}`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.fullName}</span>
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Upload Video</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* Video File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to select video file
                  </label>
                  {uploadData.videoFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadData.videoFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="thumbnail-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Click to select thumbnail image
                  </label>
                  {uploadData.thumbnail && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadData.thumbnail.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={uploadData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={uploadData.description}
                  onChange={handleInputChange}
                  placeholder="Enter video description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  disabled={isUploading}
                  required
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;