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
import Settings from './pages/Settings';
import ProtectedRoute from './components/common/ProtectedRoute';
import Tweets from './pages/Tweets';

export const routes = [
    {
        path: '/',
        element: <Layout />,
        children: [
        { path: '/', element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: '/liked', element: <ProtectedRoute>  <LikedVideos /> </ProtectedRoute>},
        { path: '/history', element: <ProtectedRoute>  <History /> </ProtectedRoute>},
        { path: '/my-content', element: <ProtectedRoute>  <MyContent /> </ProtectedRoute>},
        { path: '/playlists', element: <ProtectedRoute>  <PlaylistsPage /></ProtectedRoute>},
        { path: '/playlists/:playlistId', element: <ProtectedRoute>  <PlaylistDetailPage /></ProtectedRoute>},
        { path: '/subscriptions', element: <ProtectedRoute>  <Subscriptions /> </ProtectedRoute>},
        { path: '/tweets', element: <Tweets /> },
        { path: '/settings', element: <ProtectedRoute>  <Settings /> </ProtectedRoute>},
        { path: '/search', element: <div>Search Results</div> },
        { path: '/watch/:videoId', element: <ProtectedRoute>  <Watch /> </ProtectedRoute>},
        { path: '/channel/:username', element: <ProtectedRoute>  <Profile /> </ProtectedRoute>},
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
