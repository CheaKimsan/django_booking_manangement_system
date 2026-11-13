import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    PlayCircleRegular,
    ArrowRightRegular,
    StarRegular,
    ClockRegular,
} from "@fluentui/react-icons";
import { getMovies } from "../../app/modules/movies/core/movieService";
import { getShowtimes } from "../../app/modules/showtimes/core/request";
import type { Movie } from "../../app/modules/movies/core/model";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

const fmtReleaseDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const MovieCard: React.FC<{
    movie: Movie;
    selectedDate: Date;
    isToday: boolean;
}> = ({ movie, selectedDate, isToday }) => {
    const navigate = useNavigate();
    const dateKey = toDateKey(selectedDate);

    const { data: showtimes = [], isLoading } = useQuery({
        queryKey: ["showtimes", movie.id, dateKey],
        queryFn: () =>
            getShowtimes({
                movie: movie.id,
                date: dateKey,
                is_active: true,
            }),
        enabled: !!movie.id && !!dateKey,
        staleTime: 60_000,
    });

    const goToMovie = () => navigate(`/movies/${movie.id}`);

    const handleTimeClick = (e: React.MouseEvent, showtimeId: number) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/showtimes/${showtimeId}`);
    };

    const releaseDateLabel = fmtReleaseDate((movie as any).release_date);

    return (
        <div
            className="hp-card"
            onClick={goToMovie}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goToMovie()}
        >
            <div className="hp-card-poster">
                {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} loading="lazy" />
                ) : (
                    <div className="hp-card-poster-placeholder">
                        {movie.title.slice(0, 1).toUpperCase()}
                    </div>
                )}

                <div className="hp-card-overlay">
                    <PlayCircleRegular fontSize={48} />
                </div>

                <span className="hp-card-duration">
                    <ClockRegular fontSize={11} />
                    {movie.duration_min}m
                </span>

                {!movie.is_active && (
                    <span className="hp-card-badge">Coming Soon</span>
                )}
            </div>

            <div className="hp-card-info">
                <h3 className="hp-card-title">{movie.title}</h3>
                <div className="hp-card-meta">
                    <span className="hp-card-genre">{movie.genre}</span>
                    <span className="hp-card-dot" />
                    <span>{movie.language}</span>
                </div>

                {/* ═══════ Date + Times at the bottom ═══════ */}
                {movie.is_active && (
                    <div className="hp-card-times">
                        {releaseDateLabel && (
                            <span className="hp-card-date">
                                {releaseDateLabel}
                            </span>
                        )}

                        {isLoading ? (
                            <span className="hp-card-times-empty">
                                Loading times...
                            </span>
                        ) : showtimes.length === 0 ? (
                            <span className="hp-card-times-empty">
                                {isToday
                                    ? "No showtimes scheduled"
                                    : "No showtimes on this date"}
                            </span>
                        ) : (
                            showtimes.map((s: any) => (
                                <button
                                    key={s.id}
                                    className="hp-time-chip"
                                    onClick={(e) => handleTimeClick(e, s.id)}
                                    title={`${fmtTime(s.start_time)} · ${
                                        s.screen_detail?.name ?? ""
                                    }`}
                                >
                                    {fmtTime(s.start_time)}
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Coming Soon — show date under the meta */}
                {!movie.is_active && releaseDateLabel && (
                    <div className="hp-card-date hp-card-date-standalone">
                        {releaseDateLabel}
                    </div>
                )}
            </div>
        </div>
    );
};
// ─── Movie Grid ────────────────────────────────────────────────────
const MovieGrid: React.FC<{
    movies: Movie[];
    selectedDate: Date;
    isToday: boolean;
    emptyText?: string;
}> = ({ movies, selectedDate, isToday, emptyText = "No movies to show." }) => {
    if (movies.length === 0) {
        return <div className="hp-empty">{emptyText}</div>;
    }
    return (
        <div className="hp-grid">
            {movies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    selectedDate={selectedDate}
                    isToday={isToday}
                />
            ))}
        </div>
    );
};

// ─── Date Picker ───────────────────────────────────────────────────
const DatePicker: React.FC<{
    selectedDate: Date;
    onSelect: (d: Date) => void;
}> = ({ selectedDate, onSelect }) => {
    const today = new Date();

    const dates = useMemo(() => {
        const list: Date[] = [];
        for (let i = 0; i < 15; i++) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + i);
            list.push(d);
        }
        return list;
    }, []);

    return (
        <div className="hp-dates">
            {dates.map((date) => {
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);
                return (
                    <button
                        key={date.toISOString()}
                        className={`hp-date-card ${
                            isSelected ? "is-selected" : ""
                        } ${isToday ? "is-today" : ""}`}
                        onClick={() => onSelect(date)}
                    >
                        <span className="hp-date-day">
                            {isToday ? "Today" : DAY_NAMES[date.getDay()]}
                        </span>
                        <span className="hp-date-num">{date.getDate()}</span>
                        <span className="hp-date-month">
                            {MONTH_NAMES[date.getMonth()]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

// ─── HomePage ──────────────────────────────────────────────────────
const HomePage = () => {
    const [activeTab, setActiveTab] = useState<"now" | "coming">("now");
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const isTodaySelected = isSameDay(selectedDate, today);
    const dateKey = toDateKey(selectedDate);

    const { data: movies = [], isLoading, isError } = useQuery({
        queryKey: ["movies"],
        queryFn: () => getMovies(),
    });

    const { data: dayShowtimes = [], isLoading: loadingShowtimes } = useQuery({
        queryKey: ["showtimes", "by-date", dateKey],
        queryFn: () =>
            getShowtimes({
                date: dateKey,
                is_active: true,
            }),
        enabled: !isTodaySelected,
        staleTime: 60_000,
    });

    // ── Which movies have showtimes on this date? ─────────────────
    const movieIdsWithShowtimes = useMemo(() => {
        const ids = new Set<number>();
        dayShowtimes.forEach((s: any) => {
            if (typeof s.movie === "number") ids.add(s.movie);
        });
        return ids;
    }, [dayShowtimes]);

    const nowShowing = movies.filter((m: Movie) => m.is_active);
    const comingSoon = movies.filter((m: Movie) => !m.is_active);

    // Filter "Now Showing" by date (Today = show all)
    const nowShowingFiltered = useMemo(() => {
        if (isTodaySelected) return nowShowing;
        return nowShowing.filter((m: Movie) =>
            movieIdsWithShowtimes.has(m.id)
        );
    }, [nowShowing, isTodaySelected, movieIdsWithShowtimes]);

    const featured = nowShowing[0] ?? movies[0];

    const emptyText = isTodaySelected
        ? "No movies are currently showing."
        : "No movies have showtimes on this date.";

    return (
        <div className="hp-page">
            {/* ═══════════ HERO ═══════════ */}
            <section
                className="hp-hero"
                style={
                    featured?.poster
                        ? {
                              backgroundImage: `linear-gradient(135deg, rgba(7,10,19,0.85) 0%, rgba(7,10,19,0.55) 60%, rgba(7,10,19,0.95) 100%), url(${featured.poster})`,
                          }
                        : undefined
                }
            >
                <div className="hp-hero-content">
                    <span className="hp-hero-badge">
                        <StarRegular fontSize={13} />
                        Featured
                    </span>
                    <h1 className="hp-hero-title">
                        {featured
                            ? featured.title
                            : "Book your movie ticket in seconds"}
                    </h1>
                    <p className="hp-hero-sub">
                        {featured
                            ? featured.description ||
                              `${featured.genre} · ${featured.language} · ${featured.duration_min} minutes`
                            : "Find showtimes, pick your seats, done."}
                    </p>
                    <div className="hp-hero-actions">
                        <Link to="/movies" className="nv-pill-btn primary">
                            Browse Movies
                            <ArrowRightRegular fontSize={16} />
                        </Link>
                        {featured && (
                            <Link
                                to={`/movies/${featured.id}`}
                                className="nv-pill-btn"
                            >
                                <PlayCircleRegular fontSize={16} />
                                Book Now
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════ TABS ═══════════ */}
            <div className="hp-tabs-bar">
                <div className="hp-tabs">
                    <button
                        className={`hp-tab ${
                            activeTab === "now" ? "is-active" : ""
                        }`}
                        onClick={() => setActiveTab("now")}
                    >
                        Now Showing
                    </button>
                    <span className="hp-tab-divider" />
                    <button
                        className={`hp-tab ${
                            activeTab === "coming" ? "is-active" : ""
                        }`}
                        onClick={() => setActiveTab("coming")}
                    >
                        Coming Soon
                    </button>
                </div>
            </div>

            {/* ═══════════ DATE PICKER ═══════════ */}
            {activeTab === "now" && !isLoading && !isError && (
                <DatePicker
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                />
            )}

            {/* ═══════════ LOADING / ERROR ═══════════ */}
            {isLoading && (
                <div className="hp-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading movies...</span>
                </div>
            )}

            {isError && (
                <div className="hp-error">
                    Couldn't load movies. Try refreshing the page.
                </div>
            )}

            {/* ═══════════ MOVIE GRID ═══════════ */}
            {!isLoading && !isError && (
                <>
                    {activeTab === "now" && (
                        <>
                            {!isTodaySelected && !loadingShowtimes && (
                                <div className="hp-filter-hint">
                                    Showing movies with showtimes on{" "}
                                    <strong>
                                        {DAY_NAMES[selectedDate.getDay()]}{" "}
                                        {selectedDate.getDate()}{" "}
                                        {MONTH_NAMES[selectedDate.getMonth()]}
                                    </strong>
                                    {" · "}
                                    <button
                                        className="hp-filter-clear"
                                        onClick={() => setSelectedDate(today)}
                                    >
                                        Show today
                                    </button>
                                </div>
                            )}

                            {loadingShowtimes ? (
                                <div className="hp-loading">
                                    <div className="db-loading-spinner" />
                                    <span>Loading showtimes...</span>
                                </div>
                            ) : (
                                <MovieGrid
                                    movies={nowShowingFiltered}
                                    selectedDate={selectedDate}
                                    isToday={isTodaySelected}
                                    emptyText={emptyText}
                                />
                            )}
                        </>
                    )}

                    {activeTab === "coming" && (
                        <MovieGrid
                            movies={comingSoon}
                            selectedDate={selectedDate}
                            isToday={isTodaySelected}
                            emptyText="No upcoming movies scheduled."
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;