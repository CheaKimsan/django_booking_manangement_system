import {createBrowserRouter, Navigate} from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import RequireRole from "../../helpers/RequireRole";
import HomeRedirect from "./HomeRedireact";
import AppLayout from "../../_movie/layout/AppLayout";

import LoginPage from "../modules/auth/components/LoginPage";
import DashboardPage from "../modules/dashboard/DashboardPage";
import UserPage from "../modules/users/components/UserPage";
import MoviePage from "../modules/movies/components/MoviePage";
import CinamaPage from "../modules/cinema/components/CinamaPage";
import ShowtimePage from "../modules/showtimes/components/ShowtimePage";
import BookingPage from "../modules/booking/components/BookingPage";
import ScreensPage from "../modules/screen/components/ScreenPage";
import CustomerLayout from "../../_movie/pages/CustomerLayout";
import HomePage from "../../_movie/pages/HomePage";
import Theater from "../../_movie/pages/Theater";
import ShowtimeDetail from "../../_movie/pages/ShowtimeDetail";
import SeatSelectionPage from "../../_movie/pages/SeatSelectionPage";
import PaymentPage from "../../_movie/pages/Payment";
import BookingSuccessPage from "../../_movie/pages/BookingSuccessPage";

export const AppRoute = createBrowserRouter([
    //  PUBLIC — Auth
    {
        path: "/auth",
        element: (
            <PublicRoute>
                <LoginPage/>
            </PublicRoute>
        ),
    },
    //  CUSTOMER — Navbar layout (public + optional login)
    {
        element: <CustomerLayout/>,
        children: [
            {path: "/", element: <HomePage/>},
            {path: "/theaters", element: <Theater/>},
            {path: "/showtimes/:id", element: <ShowtimeDetail/>},   // ← new
            {
                path: "/booking/:bookingId/payment",
                element: (
                    <RequireRole
                        roles={["ADMIN", "THEATER_MANAGER", "STAFF", "CUSTOMER"]}
                    >
                        <PaymentPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Payment",
                    subtitle: "Complete your payment to confirm your booking.",
                    breadcrumb: [{label: "Booking"}, {label: "Payment"}],
                },
            },
            {
            path: "/booking/success/:code",
            element: <BookingSuccessPage />,
            handle: {
                title: "Booking Confirmed",
                subtitle: "Your seats are locked in.",
                breadcrumb: [{ label: "Booking" }, { label: "Success" }],
            },
        },
        ],

    },
    //  CUSTOMER — Requires login (still Navbar layout)
    {
        element: (
            <ProtectedRoute>
                <CustomerLayout/>
            </ProtectedRoute>
        ),
        children: [
            // { path: "/my-bookings", element: <MyBookingsPage /> },
            {path: "/booking/:showtimeId", element: <SeatSelectionPage/>},
            // { path: "/booking/success/:code", element: <BookingSuccessPage /> },
        ],
    },

    //  ADMIN — All under /management/*
    //  Layout: Sidebar (no navbar)
    {
        path: "/management",
        element: (
            <ProtectedRoute>
                <AppLayout/>
            </ProtectedRoute>
        ),
        children: [
            // Role-aware landing page
            {index: true, element: <HomeRedirect/>},
            // ── ADMIN ONLY ──────────────────────────────────
            {
                path: "users",
                element: (
                    <RequireRole roles={["ADMIN"]}>
                        <UserPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "User Management",
                    subtitle: "View, edit, and manage roles for all registered users.",
                    breadcrumb: [{label: "Home"}, {label: "Users"}],
                },
            },
            {
                path: "cinemas",
                element: (
                    <RequireRole roles={["ADMIN"]}>
                        <CinamaPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Cinema Management",
                    subtitle: "Manage all theaters in the chain.",
                    breadcrumb: [{label: "Home"}, {label: "Cinemas"}],
                },
            },

            // ── ADMIN + THEATER_MANAGER ─────────────────────
            {
                path: "screens",
                element: (
                    <RequireRole roles={["ADMIN", "THEATER_MANAGER"]}>
                        <ScreensPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Screen Management",
                    subtitle: "Manage screens and seat layouts across theaters.",
                    breadcrumb: [{label: "Home"}, {label: "Screens"}],
                },
            },

            // ── ADMIN + THEATER_MANAGER + STAFF ─────────────
            {
                path: "dashboard",
                element: (
                    <RequireRole roles={["ADMIN", "THEATER_MANAGER", "STAFF"]}>
                        <DashboardPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Dashboard Overview",
                    subtitle: "Welcome back, here's what's happening today.",
                    breadcrumb: [{label: "Home"}, {label: "Dashboard"}],
                },
            },
            {
                path: "bookings",
                element: (
                    <RequireRole roles={["ADMIN", "THEATER_MANAGER", "STAFF"]}>
                        <BookingPage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Booking Management",
                    subtitle: "View, confirm, and manage all customer reservations.",
                    breadcrumb: [{label: "Home"}, {label: "Bookings"}],
                },
            },
            {
                path: "showtimes",
                element: (
                    <RequireRole roles={["ADMIN", "THEATER_MANAGER", "STAFF"]}>
                        <ShowtimePage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Showtime Management",
                    subtitle: "Manage movie schedules, screens, and pricing.",
                    breadcrumb: [{label: "Home"}, {label: "Showtimes"}],
                },
            },
            {
                path: "movies",
                element: (
                    <RequireRole roles={["ADMIN", "THEATER_MANAGER", "STAFF"]}>
                        <MoviePage/>
                    </RequireRole>
                ),
                handle: {
                    title: "Movie Library",
                    subtitle: "Manage your catalogue.",
                    breadcrumb: [{label: "Home"}, {label: "Movies"}],
                },
            },
        ],
    },
    //  CATCH-ALL
    {path: "*", element: <Navigate to="/" replace/>},
]);