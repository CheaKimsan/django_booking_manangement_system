import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { NAV_SECTIONS } from "../../constants/nav";
import { MOCK_USER } from "../../data/user.mock";
import { useAuth } from "../../../app/modules/auth/AuthContext";
import { deriveRole, canAccess, isInternal } from "../../../helpers/Role";
import { getMovies } from "../../../app/modules/movies/core/movieService";
import { getUsers } from "../../../app/modules/users/core/userService";
import { getTheaters } from "../../../app/modules/cinema/core/cinemaService";
import { getShowtimes } from "../../../app/modules/showtimes/core/request";
import { getBookings } from "../../../app/modules/booking/core/bookingService";

import logo from "../../../_movie/assets/images/img.png";

type SidebarProps = {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose }) => {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const role = deriveRole(user);
    const internal = isInternal(role);

    const canSeeUsers = canAccess(role, ["ADMIN"]);
    const canSeeCinemas = canAccess(role, ["ADMIN"]);
    const canSeeMovies = canAccess(role, ["ADMIN", "THEATER_MANAGER", "STAFF"]);
    const canSeeShowtimes = canAccess(role, ["ADMIN", "THEATER_MANAGER", "STAFF"]);
    const canSeeBookings = canAccess(role, ["ADMIN", "THEATER_MANAGER", "STAFF"]);

    const {userProfile} = useAuth();

    const { data: users, isError: usersError } = useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers(),
        enabled: canSeeUsers,
    });

    const { data: cinemas, isError: cinemaError } = useQuery({
        queryKey: ["cinemas"],
        queryFn: () => getTheaters(),
        enabled: canSeeCinemas,
    });

    const { data: movies, isError: moviesError } = useQuery({
        queryKey: ["movies"],
        queryFn: () => getMovies(),
        enabled: canSeeMovies,
    });

    const { data: showtimes, isError: showtimesError } = useQuery({
        queryKey: ["showtimes"],
        queryFn: () => getShowtimes(),
        enabled: canSeeShowtimes,
    });

    const { data: bookings, isError: bookingsError } = useQuery({
        queryKey: ["bookings"],
        queryFn: () => getBookings(),
        enabled: canSeeBookings,
    });

    const movieCount = moviesError ? null : movies?.length ?? null;
    const userCount = usersError ? null : users?.length ?? null;
    const cinemaCount = cinemaError ? null : cinemas?.length ?? null;
    const showtimeCount = showtimesError ? null : showtimes?.length ?? null;
    const bookingCount = bookingsError ? null : bookings?.length ?? null;

    const visibleSections = useMemo(
        () =>
            NAV_SECTIONS.map((section) => ({
                ...section,
                items: section.items.filter((item) => canAccess(role, item.roles)),
            })).filter((section) => section.items.length > 0),
        [role]
    );

    const consoleLabel =
        role === "ADMIN"
            ? "Admin Console"
            : role === "THEATER_MANAGER"
            ? "Theater Manager"
            : role === "STAFF"
            ? "Staff Console"
            : "CineTick";

    const theaterName =
        (user as any)?.theater_name ?? (user as any)?.theater?.name ?? null;

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <aside
            className={`dash-sidebar ${isOpen ? "show" : ""} ${
                isCollapsed ? "collapsed" : ""
            }`}
        >
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo-link" onClick={onClose}>
                    <img
                        src={logo}
                        alt="CineTick"
                        className="sidebar-logo"
                    />
                </Link>

                <div className="logo-text-wrap">
                    <div className="logo-sub">{consoleLabel}</div>
                </div>
            </div>

            {role === "THEATER_MANAGER" && theaterName && !isCollapsed && (
                <div className="sidebar-theater">
                    <i className="bi bi-geo-alt" />
                    <span>{theaterName}</span>
                </div>
            )}

            <nav className="sidebar-nav">
                {visibleSections.map((section) => (
                    <div key={section.title}>
                        <div className="nav-section">{section.title}</div>
                        {section.items.map((item) => {
                            const badge =
                                item.id === "movies"
                                    ? movieCount
                                    : item.id === "users"
                                    ? userCount
                                    : item.id === "cinemas"
                                    ? cinemaCount
                                    : item.id === "showtimes"
                                    ? showtimeCount
                                    : item.id === "bookings"
                                    ? bookingCount
                                    : item.badge;

                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`nav-link ${
                                        isActive(item.path) ? "active" : ""
                                    }`}
                                    onClick={onClose}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <i className={`bi ${item.icon}`} />
                                    <span className="nav-label">{item.label}</span>
                                    {badge !== undefined && badge !== null && (
                                        <span
                                            className={`nav-badge ${
                                                item.badgeVariant === "soft" ? "soft" : ""
                                            }`}
                                        >
                                            {badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">{MOCK_USER.initials}</div>
                    <div className="user-info">
                        <div className="user-info-name">{user?.username}</div>
                        <div className="user-info-email">
                            {user?.email} · {role.replace("_", " ")}
                        </div>
                    </div>
                    <i
                        className="bi bi-three-dots-vertical"
                        style={{ color: "var(--text-dim)" }}
                    />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;