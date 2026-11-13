export type UserRole = "ADMIN" | "THEATER_MANAGER" | "STAFF" | "CUSTOMER";

export type NavItem = {
    id: string;
    label: string;
    path: string;
    icon: string;
    badge?: number;
    badgeVariant?: "soft";
    roles?: UserRole[];
};

export type NavSection = {
    title: string;
    items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
    {
        title: "Main",
        items: [
            {
                id: "dashboard",
                label: "Dashboard",
                path: "/management/dashboard",           // ← updated
                icon: "bi-grid-1x2",
                roles: ["ADMIN", "THEATER_MANAGER", "STAFF"],
            },
            {
                id: "bookings",
                label: "Bookings",
                path: "/management/bookings",            // ← updated
                icon: "bi-ticket-perforated",
                roles: ["ADMIN", "THEATER_MANAGER", "STAFF"],
            },
        ],
    },
    {
        title: "Management",
        items: [
            {
                id: "movies",
                label: "Movies",
                path: "/management/movies",              // ← updated
                icon: "bi-camera-reels",
                badgeVariant: "soft",
                roles: ["ADMIN", "THEATER_MANAGER", "STAFF"],
            },
            {
                id: "showtimes",
                label: "Showtimes",
                path: "/management/showtimes",           // ← updated
                icon: "bi-calendar-event",
                badgeVariant: "soft",
                roles: ["ADMIN", "THEATER_MANAGER", "STAFF"],
            },
            {
                id: "screens",
                label: "Screens",
                path: "/management/screens",             // ← updated
                icon: "bi-display",
                roles: ["ADMIN", "THEATER_MANAGER"],
            },
            {
                id: "cinemas",
                label: "Cinemas",
                path: "/management/cinemas",             // ← updated
                icon: "bi-building",
                badgeVariant: "soft",
                roles: ["ADMIN"],
            },
            {
                id: "users",
                label: "Users",
                path: "/management/users",               // ← updated
                icon: "bi-people",
                badgeVariant: "soft",
                roles: ["ADMIN"],
            },
        ],
    },
];