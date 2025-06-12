import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Camera,
  User,
  Mail,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import axios from "../config/axios.js"; // Adjust path according to your axios config
import { useAuth } from '../context/AuthContext';// Adjust path according to your auth context
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, setUser } = useAuth();

  // State for form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  // State for password change
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // State for images
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");

  // State for loading
  const [isLoading, setIsLoading] = useState({
    profile: false,
    avatar: false,
    coverImage: false,
    password: false,
    fetchingUser: true,
  });

  // File input refs
  const avatarInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  // Fetch current user data on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/users/current-user");
      const userData = response.data.data;

      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
      });

      setAvatarPreview(
        userData.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      );
      setCoverImagePreview(
        userData.coverImage ||
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop"
      );
    } catch (error) {
      toast.error("Failed to fetch user data");
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, fetchingUser: false }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle profile details update
  const handleProfileUpdate = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading((prev) => ({ ...prev, profile: true }));

    try {
      const response = await axios.patch("/users/update-account", {
        fullName: formData.fullName,
        email: formData.email,
      });

      // Update user context if available
      if (setUser && response.data.data) {
        setUser(response.data.data);
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Handle password change submission
  const handlePasswordChange = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsLoading((prev) => ({ ...prev, password: true }));

    try {
      await axios.post("/users/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update password. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating password:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, password: false }));
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);

    setIsLoading((prev) => ({ ...prev, avatar: true }));

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.patch("/users/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user context if available
      if (setUser && response.data.data) {
        setUser(response.data.data);
      }

      toast.success("Avatar updated successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update avatar. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating avatar:", error);

      // Revert preview on error
      setAvatarPreview(
        user?.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, avatar: false }));
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setCoverImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setIsLoading((prev) => ({ ...prev, coverImage: true }));

    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      const response = await axios.patch("/users/cover-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user context if available
      if (setUser && response.data.data) {
        setUser(response.data.data);
      }

      toast.success("Cover image updated successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update cover image. Please try again.";
      toast.error(errorMessage);
      console.error("Error updating cover image:", error);

      // Revert preview on error
      setCoverImagePreview(
        user?.coverImage ||
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, coverImage: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl my-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Loading state for initial data fetch */}
        {isLoading.fetchingUser ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cover Image Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <button
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={isLoading.coverImage}
                  className="absolute bottom-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading.coverImage ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera size={16} />
                  )}
                  Change Cover
                </button>
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isLoading.avatar}
                      className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading.avatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={16} />
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Click the camera icon to change your profile picture
                  </p>
                </div>

                {/* Profile Form */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProfileUpdate}
                      disabled={isLoading.profile}
                      className="w-full lg:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {isLoading.profile ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      {isLoading.profile ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Change Password
              </h3>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      id="oldPassword"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("old")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={isLoading.password}
                  className="w-full lg:w-auto bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {isLoading.password ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lock size={16} />
                  )}
                  {isLoading.password ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Additional Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Privacy Settings
                    </h4>
                    <p className="text-sm text-gray-500">
                      Manage who can see your content
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Notification Preferences
                    </h4>
                    <p className="text-sm text-gray-500">
                      Choose what notifications you receive
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Account Security
                    </h4>
                    <p className="text-sm text-gray-500">
                      Two-factor authentication and login history
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;