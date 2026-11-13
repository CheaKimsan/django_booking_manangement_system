import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    SearchRegular,
    DismissRegular,
    BookmarkRegular,
    SignOutRegular,
    SettingsRegular,
    PersonRegular,
    AlertRegular,
    LocationRegular,
    ChevronDownRegular,
    NavigationRegular,
    ClockRegular,
} from "@fluentui/react-icons";
import { useAuth } from "../../app/modules/auth/AuthContext";
import { deriveRole } from "../../helpers/Role";
import { getMovies } from "../../app/modules/movies/core/movieService";
import type { Movie } from "../../app/modules/movies/core/model";

const NAV_LINKS = [
    { label: "Home",       path: "/",           icon: null },
    { label: "Showtimes",  path: "/showtimes",  icon: null },
    { label: "Theaters",   path: "/theaters",   icon: LocationRegular },
    { label: "Promotions", path: "/promotions", icon: AlertRegular },
];

const Navbar: React.FC = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const userRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);

    // ── Fetch all movies once (cached) for the suggestions ─────
    const { data: movies = [] } = useQuery({
        queryKey: ["movies"],
        queryFn: () => getMovies(),
        staleTime: 5 * 60_000, // 5 min
    });

    // ── Filter movies by query ─────────────────────────────────
    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 1) return [];
        return movies
            .filter((m: Movie) => {
                return (
                    m.title.toLowerCase().includes(q) ||
                    (m.genre ?? "").toLowerCase().includes(q) ||
                    (m.language ?? "").toLowerCase().includes(q)
                );
            })
            .slice(0, 6); // max 6 suggestions
    }, [movies, query]);

    // scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // click outside user menu / suggestions
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 50);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
                setUserMenuOpen(false);
                setMobileOpen(false);
                setShowSuggestions(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
        setShowSuggestions(false);
    }, [pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        navigate(`/movies?q=${encodeURIComponent(q)}`);
        setSearchOpen(false);
        setShowSuggestions(false);
        setQuery("");
    };

    const handleSuggestionClick = (movieId: number) => {
        navigate(`/movies/${movieId}`);
        setSearchOpen(false);
        setShowSuggestions(false);
        setQuery("");
    };

    const isActive = (path: string) =>
        path === "/" ? pathname === "/" : pathname.startsWith(path);

    const initials = user?.username?.slice(0, 2).toUpperCase() ?? "?";
    const role = deriveRole(user);
    const isInternal = role !== "CUSTOMER";

    // ─── Suggestions list — reused in desktop inline + mobile overlay
    const SuggestionsList = () => {
        if (!showSuggestions || query.trim().length === 0) return null;

        return (
            <div className="nv-suggestions">
                {suggestions.length === 0 ? (
                    <div className="nv-suggestion-empty">
                        No movies found for "{query}"
                    </div>
                ) : (
                    <>
                        {suggestions.map((movie: Movie) => (
                            <button
                                key={movie.id}
                                className="nv-suggestion"
                                onClick={() => handleSuggestionClick(movie.id)}
                            >
                                <div className="nv-suggestion-poster">
                                    {movie.poster ? (
                                        <img
                                            src={movie.poster}
                                            alt={movie.title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span>
                                            {movie.title.slice(0, 1).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="nv-suggestion-info">
                                    <div className="nv-suggestion-title">
                                        {movie.title}
                                    </div>
                                    <div className="nv-suggestion-meta">
                                        <span>{movie.genre}</span>
                                        <span className="nv-suggestion-dot" />
                                        <span>{movie.language}</span>
                                        <span className="nv-suggestion-dot" />
                                        <span>
                                            <ClockRegular fontSize={10} />
                                            {movie.duration_min}m
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                        <button
                            className="nv-suggestion-all"
                            onClick={handleSearch as any}
                        >
                            See all results for "{query}"
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            <header className={`nv-root ${scrolled ? "is-scrolled" : ""}`}>
                <div className="nv-row nv-row-1">
                    <div className="nv-inner">
                        {/* ═══ Search (with live suggestions) ═══ */}
                        <div
                            className="nv-search-wrap"
                            ref={suggestionRef}
                        >
                            <form
                                className="nv-search-inline"
                                onSubmit={handleSearch}
                            >
                                <SearchRegular fontSize={16} />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {query && (
                                    <button
                                        type="button"
                                        className="nv-search-clear"
                                        onClick={() => {
                                            setQuery("");
                                            setShowSuggestions(false);
                                        }}
                                        aria-label="Clear"
                                    >
                                        <DismissRegular fontSize={14} />
                                    </button>
                                )}
                            </form>

                            <SuggestionsList />
                        </div>

                        <div className="nv-actions">
                            <button
                                className="nv-icon-btn nv-search-mobile"
                                onClick={() => {
                                    setSearchOpen(true);
                                    setTimeout(() => searchRef.current?.focus(), 50);
                                }}
                                aria-label="Search"
                            >
                                <SearchRegular fontSize={18} />
                            </button>

                            {isInternal && (
                                <button
                                    className="nv-console-btn"
                                    onClick={() => navigate("/management/dashboard")}
                                >
                                    <SettingsRegular fontSize={15} />
                                    <span>Console</span>
                                </button>
                            )}

                            {!user ? (
                                <>
                                    <Link to="/auth" className="nv-pill-btn">
                                        <PersonRegular fontSize={16} />
                                        <span>Log In</span>
                                    </Link>
                                    <Link to="/auth" className="nv-pill-btn primary">
                                        <span>Sign Up</span>
                                    </Link>
                                </>
                            ) : (
                                <div className="nv-user" ref={userRef}>
                                    <button
                                        className={`nv-user-chip ${
                                            userMenuOpen ? "is-active" : ""
                                        }`}
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        aria-label="User menu"
                                    >
                                        <span className="nv-user-avatar">
                                            {initials}
                                        </span>
                                        <span className="nv-user-name">
                                            {user.username}
                                        </span>
                                        <ChevronDownRegular fontSize={12} />
                                    </button>

                                    {userMenuOpen && (
                                        <div className="nv-dropdown">
                                            <div className="nv-dropdown-head">
                                                <span className="nv-user-avatar lg">
                                                    {initials}
                                                </span>
                                                <div className="nv-dropdown-info">
                                                    <div className="nv-dropdown-name">
                                                        {user.username}
                                                    </div>
                                                    <div className="nv-dropdown-email">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="nv-dropdown-divider" />

                                            {isInternal && (
                                                <button
                                                    className="nv-dropdown-item"
                                                    onClick={() => {
                                                        navigate(
                                                            "/management/dashboard"
                                                        );
                                                        setUserMenuOpen(false);
                                                    }}
                                                >
                                                    <SettingsRegular fontSize={16} />
                                                    Admin Console
                                                </button>
                                            )}

                                            <button
                                                className="nv-dropdown-item"
                                                onClick={() => {
                                                    navigate("/my-bookings");
                                                    setUserMenuOpen(false);
                                                }}
                                            >
                                                <BookmarkRegular fontSize={16} />
                                                My Bookings
                                            </button>

                                            <button
                                                className="nv-dropdown-item"
                                                onClick={() => {
                                                    navigate("/profile");
                                                    setUserMenuOpen(false);
                                                }}
                                            >
                                                <SettingsRegular fontSize={16} />
                                                Account Settings
                                            </button>

                                            <div className="nv-dropdown-divider" />

                                            <button
                                                className="nv-dropdown-item danger"
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                    navigate("/");
                                                }}
                                            >
                                                <SignOutRegular fontSize={16} />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="nv-icon-btn nv-mobile-toggle"
                                onClick={() => setMobileOpen((v) => !v)}
                                aria-label="Menu"
                            >
                                {mobileOpen ? (
                                    <DismissRegular fontSize={20} />
                                ) : (
                                    <NavigationRegular fontSize={20} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ Row 2 — nav links ═══ */}
                <div className="nv-row nv-row-2">
                    <div className="nv-inner">
                        <nav className="nv-nav">
                            {NAV_LINKS.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`nv-nav-link ${
                                            active ? "is-active" : ""
                                        }`}
                                    >
                                        {Icon && <Icon fontSize={15} />}
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <button className="nv-location-btn">
                            <LocationRegular fontSize={15} />
                            <span>Find a theater</span>
                            <ChevronDownRegular fontSize={11} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            <div
                className={`nv-mobile-overlay ${mobileOpen ? "is-open" : ""}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile panel */}
            <aside className={`nv-mobile-panel ${mobileOpen ? "is-open" : ""}`}>
                <div className="nv-mobile-head">
                    <span style={{ fontSize: 16, fontWeight: 700 }}>Menu</span>
                    <button
                        className="nv-icon-btn"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                    >
                        <DismissRegular fontSize={20} />
                    </button>
                </div>

                <nav className="nv-mobile-links">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nv-mobile-link ${
                                isActive(link.path) ? "is-active" : ""
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user && (
                        <Link
                            to="/my-bookings"
                            className={`nv-mobile-link ${
                                pathname.startsWith("/my-bookings")
                                    ? "is-active"
                                    : ""
                            }`}
                        >
                            My Bookings
                        </Link>
                    )}
                </nav>

                <div className="nv-mobile-foot">
                    {!user ? (
                        <>
                            <Link to="/auth" className="nv-pill-btn w-100">
                                <PersonRegular fontSize={16} />
                                Log In
                            </Link>
                            <Link to="/auth" className="nv-pill-btn primary w-100">
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="nv-mobile-user">
                                <span className="nv-user-avatar">{initials}</span>
                                <div>
                                    <div className="nv-dropdown-name">
                                        {user.username}
                                    </div>
                                    <div className="nv-dropdown-email">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="nv-pill-btn danger w-100"
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                            >
                                Sign out
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* ═══ Search overlay (mobile + Cmd+K) ═══ */}
            {searchOpen && (
                <div
                    className="nv-search-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSearchOpen(false);
                            setShowSuggestions(false);
                        }
                    }}
                >
                    <div className="nv-search-modal" ref={suggestionRef}>
                        <form className="nv-search-box" onSubmit={handleSearch}>
                            <SearchRegular fontSize={20} />
                            <input
                                ref={searchRef}
                                className="nv-search-input"
                                type="text"
                                placeholder="Search movies, showtimes..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {query && (
                                <button
                                    type="button"
                                    className="nv-search-clear"
                                    onClick={() => {
                                        setQuery("");
                                        setShowSuggestions(false);
                                    }}
                                    aria-label="Clear"
                                >
                                    <DismissRegular fontSize={14} />
                                </button>
                            )}
                            <button
                                type="button"
                                className="nv-search-close"
                                onClick={() => {
                                    setSearchOpen(false);
                                    setShowSuggestions(false);
                                }}
                                aria-label="Close search"
                            >
                                <DismissRegular fontSize={18} />
                            </button>
                        </form>

                        <SuggestionsList />

                        {!showSuggestions && (
                            <div className="nv-search-hint">
                                Press <kbd>Enter</kbd> to search ·{" "}
                                <kbd>Esc</kbd> to close
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;