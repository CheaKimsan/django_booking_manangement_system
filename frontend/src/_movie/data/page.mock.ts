export const PAGE_META: Record<
    string,
    {
        title: string;
        subtitle?: string;
        breadcrumb?: { label: string }[];
    }
> = {
    "/dashboard": {
        title: "Dashboard Overview",
        subtitle: "Welcome back, here's what's happening today.",
    },
    "/movies": {
        title: "Movie Library",
        subtitle: "Manage your catalogue and showtimes.",
    },
    "/bookings": {
        title: "Bookings",
        subtitle: "All customer reservations.",
    },
    "/users": {
        title: "User Management",
        subtitle: "View, edit, and manage roles for all registered users.",
    },
    "/cinemas": {
        title: "Cinema Overview",
        subtitle: "Manage cinemas, screens, and theater availability.",
    },
    "/showtimes": {
        title: "Showtime Schedule",
        subtitle: "Manage movie screenings, schedules, and theater availability.",
    },
    // ── NEW ─────────────────────────────────────────────
    "/my-bookings": {
        title: "My Bookings",
        subtitle: "View and manage your reservations.",
    },
    "/booking": {
        title: "Book Tickets",
        subtitle: "Select your seats and confirm.",
    },
};