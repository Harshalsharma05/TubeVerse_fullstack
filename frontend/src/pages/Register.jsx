import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import axios from '../config/axios.js';

const API_URL = axios.defaults.baseURL;
console.log('API URL:', API_URL);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        avatar: null,
        coverImage: null
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
        }));
        if (errors[name]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!formData.email.includes('@') || !formData.email.includes('.')) {
        newErrors.email = 'Invalid email format';
        }
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.avatar) newErrors.avatar = 'Avatar is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('avatar', formData.avatar);
            if (formData.coverImage) {
                formDataToSend.append('coverImage', formData.coverImage);
            }
            
            console.log('Sending request to:', `${API_URL}/api/v1/users/register`);

            const response = await axios.post(
                '/users/register',
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.statusCode === 200 || response.status === 201) {
                toast.success(response.data.message || 'Registration successful!');
                navigate('/auth/login');
            } else {
                throw new Error(response.data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
            <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create your account
            </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Choose a username"
                autoComplete="username"
                />
                <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="Enter your full name"
                autoComplete="name"
                />
                <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="email"
                />
                <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a password"
                autoComplete="new-password"
                />
                <Input
                label="Profile Picture (Avatar)"
                type="file"
                name="avatar"
                onChange={handleChange}
                error={errors.avatar}
                accept="image/*"
                required
                />
                <Input
                label="Cover Image (Optional)"
                type="file"
                name="coverImage"
                onChange={handleChange}
                error={errors.coverImage}
                accept="image/*"
                />
            </div>

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>

            <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link 
                to="/auth/login" 
                className="font-medium text-primary-600 hover:text-primary-500"
                >
                Sign in here
                </Link>
            </div>
            </form>
        </div>
        </div>
    );
};

export default Register;
