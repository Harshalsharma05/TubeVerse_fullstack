import { Search, Upload, Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import ytLogo from '../../assets/ytlogo-dark.png'
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-full">
                <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2">
                <img src={ytLogo} alt="YouTube Logo" className="h-8" />
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
            <button className="p-2 hover:bg-gray-100 rounded-full">
                <Upload size={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell size={24} />
            </button>
            {user && (
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
            )}
            </div>
        </div>
        </nav>
    );
};

export default Navbar;