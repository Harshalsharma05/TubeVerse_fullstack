// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import axios from '../config/axios';

const API_URL = axios.defaults.baseURL;
console.log('API URL:', API_URL);

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        identifier: '', // This will be either username or email
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.identifier) {
        newErrors.identifier = 'Username or email is required';
        }
        if (!formData.password) {
        newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            
            const loginData = {
                password: formData.password,
                [formData.identifier.includes('@') ? 'email' : 'username']: formData.identifier
            };

            console.log('Sending request to:', `${API_URL}/api/v1/users/login`);

            const response = await axios.post(
                '/users/login',
                loginData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Check both statusCode and status
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                const { user, accessToken } = response.data.data;
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('accessToken', accessToken);
                
                toast.success(response.data.message || 'Login successful!');
                navigate('/', {replace: true});
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            
            if (error.response?.status === 404) {
                setErrors(prev => ({
                    ...prev,
                    identifier: 'User does not exist'
                }));
            } else if (error.response?.status === 401) {
                setErrors(prev => ({
                    ...prev,
                    password: 'Invalid password'
                }));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
            <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
            </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <Input
                label="Username or Email"
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                error={errors.identifier}
                placeholder="Enter your username or email"
                autoComplete="username email"
                />
                <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                />
            </div>

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>

            <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link 
                to="/auth/register" 
                className="font-medium text-primary-600 hover:text-primary-500"
                >
                Register here
                </Link>
            </div>
            </form>
        </div>
        </div>
    );
};

export default Login;