import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import MyContent from './pages/MyContent';
import Subscriptions from './pages/Subscriptions';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';

export const routes = [
    {
        path: '/',
        element: <Layout />,
        children: [
        { path: '/', element: <Home /> },
        { path: '/liked', element: <LikedVideos /> },
        { path: '/history', element: <History /> },
        { path: '/my-content', element: <MyContent /> },
        { path: '/playlists', element: <PlaylistsPage />},
        { path: '/playlists/:playlistId', element: <PlaylistDetailPage />},
        { path: '/subscriptions', element: <Subscriptions /> },
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
