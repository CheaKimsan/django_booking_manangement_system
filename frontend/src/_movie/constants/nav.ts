import type {NavSection} from '../types/nav';

export const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Main',
        items: [
            {id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', path: '/dashboard'},
            {id: 'analytics', label: 'Analytics', icon: 'bi-graph-up-arrow', path: '/analytics'},
            {
                id: 'bookings', label: 'Bookings', icon: 'bi-ticket-perforated', path: '/bookings',
                badge: '24', badgeVariant: 'solid'
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                id: 'movies', label: 'Movies', icon: 'bi-camera-reels', path: '/movies',
                badgeVariant: 'soft'
            },
            {
                id: 'showtimes', label: 'Showtimes', icon: 'bi-calendar-event', path: '/showtimes', badgeVariant: 'soft'
            },
            {
                id: 'cinemas', label: 'Cinemas', icon: 'bi-building', path: '/cinemas', badgeVariant: 'soft'
            },
            {
                id: 'users', label: 'Users', icon: 'bi-people', path: '/users', badgeVariant: 'soft'
            },
        ],
    },
    {
        title: 'System',
        items: [
            {id: 'promotions', label: 'Promotions', icon: 'bi-tags', path: '/promotions'},
            {id: 'settings', label: 'Settings', icon: 'bi-gear', path: '/settings'},
        ],
    },
];