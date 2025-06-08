import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Profile from './pages/Profile';

export const routes = [
    {
        path: '/',
        element: <Layout />,
        children: [
        { path: '/', element: <Home /> },
        { path: '/liked', element: <div>Liked Videos</div> },
        { path: '/history', element: <div>History</div> },
        { path: '/my-content', element: <div>My Content</div> },
        { path: '/playlists', element: <div>Playlists</div> },
        { path: '/subscriptions', element: <div>Subscriptions</div> },
        { path: '/tweets', element: <div>Tweets</div> },
        { path: '/settings', element: <div>Settings</div> },
        { path: '/search', element: <div>Search Results</div> },
        { path: '/watch/:videoId', element: <Watch /> },
        { path: '/channel/:username', element: <Profile /> },
        ],
    },
    {
        path: '/auth',
        children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '', element: <Navigate to="/auth/login" replace /> },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
];

export const router = createBrowserRouter(routes);
