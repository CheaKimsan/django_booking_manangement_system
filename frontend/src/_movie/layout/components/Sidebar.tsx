import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';

import {NAV_SECTIONS} from '../../constants/nav';
import {MOCK_USER} from '../../data/user.mock';
import {getMovies} from '../../../app/modules/movies/core/movieService';
import {getUsers} from '../../../app/modules/users/core/userService';
import {getTheaters} from "../../../app/modules/cinema/core/cinemaService";
import {getShowtimes} from "../../../app/modules/showtimes/core/request";

type SidebarProps = {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             isCollapsed,
                                             onClose,
                                         }) => {
    const {pathname} = useLocation();

    const {
        data: movies,
        isError: moviesError,
    } = useQuery({
        queryKey: ['movies'],
        queryFn: () => getMovies(),
    });

    const {
        data: users,
        isError: cinemaError,
    } = useQuery({
        queryKey: ['cinemas'],
        queryFn: () => getTheaters(),
    });

    const {
        data: cinemas,
        isError: usersError,
    } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(),
    });

    const {
        data: showtimes,
        isError: showtimesError,
    } = useQuery({
        queryKey: ['showtimes'],
        queryFn: () => getShowtimes(),
    });

    const movieCount = moviesError ? null : movies?.length ?? null;
    const userCount = usersError ? null : users?.length ?? null;
    const cinemaCount = cinemaError ? null : cinemas?.length ?? null;
    const showtimeCount = showtimesError ? null : showtimes?.length ?? null;


    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <aside
            className={`dash-sidebar ${isOpen ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''
            }`}
        >
            <div className="sidebar-header">
                <div className="logo-mark">
                    <i className="bi bi-film"/>
                </div>

                <div className="logo-text-wrap">
                    <div className="logo-text">
                        LEGEND<span>.</span>
                    </div>
                    <div className="logo-sub">Admin Console</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                        <div className="nav-section">{section.title}</div>

                        {section.items.map((item) => {
                            const badge =
                                item.id === 'movies'
                                    ? movieCount
                                    : item.id === 'users'
                                        ? userCount
                                        : item.id === 'cinemas'
                                            ? cinemaCount
                                            : item.id === 'showtimes'
                                                ? showtimeCount
                                                : item.badge;

                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''
                                    }`}
                                    onClick={onClose}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <i className={`bi ${item.icon}`}/>

                                    <span className="nav-label">{item.label}</span>

                                    {badge !== undefined && badge !== null && (
                                        <span
                                            className={`nav-badge ${item.badgeVariant === 'soft' ? 'soft' : ''
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
                        <div className="user-info-name">{MOCK_USER.name}</div>
                        <div className="user-info-email">{MOCK_USER.email}</div>
                    </div>

                    <i
                        className="bi bi-three-dots-vertical"
                        style={{color: 'var(--text-dim)'}}
                    />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;