import React from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import {useSidebar} from './core/useSidebar';

// Page meta lookup — keyed by route prefix
const PAGE_META: Record<
    string,
    {
        title: string;
        subtitle?: string;
        breadcrumb?: { label: string }[];
    }
> = {
    '/dashboard': {
        title: 'Dashboard Overview',
        subtitle: "Welcome back, here's what's happening today.",
    },
    '/movies': {
        title: 'Movie Library',
        subtitle: 'Manage your catalogue and showtimes.',
    },
    '/bookings': {
        title: 'Bookings',
        subtitle: 'All customer reservations.',
    },
    '/users': {
        title: 'User Management',
        subtitle: 'View, edit, and manage roles for all registered users.',
    },
    '/cinemas': {
        title: 'Cinema Overview',
        subtitle: 'Manage cinemas, screens, and theater availability.',
    },
    '/showtimes': {
    title: 'Showtime Schedule',
    subtitle: 'Manage movie screenings, schedules, and theater availability.',
},
};

const AppLayout: React.FC = () => {
    const {isOpen, isCollapsed, toggle, close, toggleCollapse} = useSidebar();
    const {pathname} = useLocation();

    const metaKey = Object.keys(PAGE_META).find((key) => pathname.startsWith(key));
    const meta = metaKey ? PAGE_META[metaKey] : {title: 'Dashboard'};

    React.useEffect(() => {
        close();
    }, [pathname, close]);

    return (
        <div className={`dash-root ${isCollapsed ? 'is-collapsed' : ''}`}>
            <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} onClose={close}/>

            <div
                className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
                onClick={close}
                aria-hidden="true"
            />

            <div className="dash-main">
                <Header
                    meta={meta}
                    isCollapsed={isCollapsed}
                    onMenuClick={toggle}
                    onCollapseClick={toggleCollapse}
                />

                <main className="dash-content">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;