import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
            <Sidebar isOpen={isSidebarOpen} />
            <main className={`flex-1 p-4 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <Outlet />
            </main>
        </div>
        </div>
    );
};

export default Layout;