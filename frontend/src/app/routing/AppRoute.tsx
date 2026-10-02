import {createBrowserRouter, Navigate} from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../../_movie/layout/AppLayout';

import LoginPage from '../modules/auth/components/LoginPage';
import DashboardPage from '../modules/dashboard/DashboardPage';
import UserPage from "../modules/users/components/UserPage";
import MoviePage from "../modules/movies/components/MoviePage";
import CinamaPage from "../modules/cinema/components/CinamaPage";
import ShowtimePage from "../modules/showtimes/components/ShowtimePage";

export const AppRoute = createBrowserRouter([
    {
        path: '/auth',
        element: (
            <PublicRoute>
                <LoginPage/>
            </PublicRoute>
        ),
    },
    {
        element: (
            <ProtectedRoute>
                <AppLayout/>
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage/>,
                handle: {
                    title: 'Dashboard Overview',
                    subtitle: "Welcome back, here's what's happening today.",
                    breadcrumb: [{label: 'Home'}, {label: 'Dashboard'}],
                },
            },
            {
                path: '/movies',
                element: <MoviePage/>,
                handle: {
                    title: 'User Overview',
                    subtitle: "Welcome back, here's what's happening today.",
                    breadcrumb: [{label: 'Users'}, {label: 'User Management'}],
                },
            },
            {
                path: '/showtimes',
                element: <ShowtimePage/>,
                handle: {
                    title: 'Showtime Management',
                    subtitle: "Manage movie schedules, screens, and pricing.",
                    breadcrumb: [{label: 'Showtimes'}, {label: 'Showtime Management'}],
                },
            },

            {
                path: '/cinemas',
                element: <CinamaPage/>,
                handle: {
                    title: 'Cinema Overview',
                    subtitle: "Welcome back, here's what's happening today.",
                    breadcrumb: [{label: 'Cinemas'}, {label: 'Cinema Management'}],
                },
            },

            {
                path: '/users',
                element: <UserPage/>,
                handle: {
                    title: 'User Overview',
                    subtitle: "Welcome back, here's what's happening today.",
                    breadcrumb: [{label: 'User'}, {label: 'User Management'}],
                },
            },


        ],
    },
    {
        path: '*',
        element: <Navigate to="/auth" replace/>,
    },
]);