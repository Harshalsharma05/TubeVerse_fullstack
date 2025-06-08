import toast from 'react-hot-toast';
import axios from '../config/axios.js';

export const logout = async () => {
    try {
        await axios.post('/users/logout', {}, {
        withCredentials: true // Important for sending cookies
        });
        
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        
        toast.success('Logged out successfully');
        
        // Redirect to login page
        window.location.href = '/auth/login';
    } catch (error) {
        toast.error('Failed to logout');
    }
};
