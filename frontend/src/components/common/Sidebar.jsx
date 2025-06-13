import { Link } from 'react-router-dom';
import {
    Home,
    ThumbsUp,
    History,
    PlaySquare,
    List,
    Users,
    MessageSquare,
    Settings,
    LogOut
} from 'lucide-react';
import { logout } from '../../utils/auth';

const SidebarItem = ({ icon: Icon, text, to, isCollapsed }) => (
    <Link
        to={to}
        className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-4 px-6 py-3 hover:bg-gray-100 transition-colors`}
    >
        <Icon size={20} />
        {!isCollapsed && <span>{text}</span>}
    </Link>
);

const Sidebar = ({ isOpen }) => {
    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside
            className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r transition-all duration-300 ${
                isOpen ? 'w-64' : 'w-16'
            }`}
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 py-2">
                    <SidebarItem icon={Home} text="Home" to="/" isCollapsed={!isOpen} />
                    <SidebarItem icon={ThumbsUp} text="Liked Videos" to="/liked" isCollapsed={!isOpen} />
                    <SidebarItem icon={History} text="History" to="/history" isCollapsed={!isOpen} />
                    <SidebarItem icon={PlaySquare} text="My Content" to="/my-content" isCollapsed={!isOpen} />
                    <SidebarItem icon={List} text="Playlists" to="/playlists" isCollapsed={!isOpen} />
                    <SidebarItem icon={Users} text="Subscriptions" to="/subscriptions" isCollapsed={!isOpen} />
                    <SidebarItem icon={MessageSquare} text="Tweets" to="/tweets" isCollapsed={!isOpen} />

                    {/* Created By Section */}
                    <div className={`mt-4 px-6 text-sm text-gray-700 ${!isOpen ? 'text-center px-2' : ''}`}>
                        {isOpen ? (
                            <>
                                Created by:{' '}
                                <a
                                    href="https://github.com/Harshalsharma05"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Harshal Sharma
                                </a>
                            </>
                        ) : (
                            <a
                                href="https://github.com/Harshalsharma05"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                title="Created by Harshal Sharma"
                            >
                                ©
                            </a>
                        )}
                    </div>
                </div>

                <div className="border-t py-2">
                    <SidebarItem icon={Settings} text="Settings" to="/settings" isCollapsed={!isOpen} />
                    <button 
                        onClick={handleLogout}
                        className={`flex items-center ${!isOpen ? 'justify-center' : ''} gap-4 px-6 py-3 w-full hover:bg-gray-100 transition-colors text-red-500`}
                    >
                        <LogOut size={20} />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
