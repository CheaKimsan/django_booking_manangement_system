import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import {
    CalendarLtrRegular,
    BookmarkRegular,
    MoneyRegular,
    ArrowTrendingRegular,
    SparkleRegular,
    ClockRegular,
    Video16Regular,
    PeopleRegular,
} from "@fluentui/react-icons";
import {
    LineChart,
    GroupedVerticalBarChart,
    DonutChart,
    type IChartProps,
    type ILineChartPoints,
    type IGroupedVerticalBarChartData,
    type IChartDataPoint,
} from "@fluentui/react-charting";

import { getMovies } from "../movies/core/movieService";
import { getShowtimes } from "../showtimes/core/request";
import { getUsers } from "../users/core/userService";
import { getBookings } from "../booking/core/bookingService";

const COLORS = ["#e11d48", "#eab05e", "#8b5cf6", "#10b981", "#3b82f6", "#f43f5e", "#fbbf24"];

// ─── Date helpers ───────────────────────────────────────────────────
const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const dayLabel = (key: string) =>
    new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric" });

function lastNDays(n: number): string[] {
    const days: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
};

const fmtPrice = (p: string | null | undefined) => {
    if (!p) return "$0.00";
    const n = parseFloat(p);
    return isNaN(n) ? "$0.00" : `$${n.toFixed(2)}`;
};

const statusClass: Record<string, string> = {
    PENDING: "warning",
    CONFIRMED: "success",
    CANCELLED: "danger",
    EXPIRED: "danger",
    COMPLETED: "admin",
};

// ─── Component ──────────────────────────────────────────────────────
const DashboardPage = () => {
    const { user } = useAuth();

    // ─── Queries ───────────────────────────────────────────────────
    const { data: movies = [], isLoading: loadingMovies } = useQuery({
        queryKey: ["movies"],
        queryFn: () => getMovies(),
    });

    const { data: showtimes = [], isLoading: loadingShowtimes } = useQuery({
        queryKey: ["showtimes"],
        queryFn: () => getShowtimes(),
    });

    const { data: usersRaw, isLoading: loadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers(),
    });

    const { data: bookingsRaw, isLoading: loadingBookings } = useQuery({
        queryKey: ["bookings"],
        queryFn: () => getBookings(),
    });

    // ─── Normalize users & bookings (handle paginated or plain array) ──
    const users = useMemo(() => {
        if (!usersRaw) return [];
        if (Array.isArray(usersRaw)) return usersRaw;
        return (usersRaw as any).results ?? [];
    }, [usersRaw]);

    const bookings = useMemo(() => {
        if (!bookingsRaw) return [];
        if (Array.isArray(bookingsRaw)) return bookingsRaw;
        return (bookingsRaw as any).results ?? [];
    }, [bookingsRaw]);

    const isLoading =
        loadingMovies || loadingShowtimes || loadingUsers || loadingBookings;

    // ─── KPIs ──────────────────────────────────────────────────────
    const totalMovies = movies.length;
    const totalShowtimes = showtimes.length;
    const totalUsers = users.length;
    const totalBookings = bookings.length;

    const totalRevenue = useMemo(
        () =>
            bookings.reduce((sum: number, b: any) => {
                if (b.status !== "CONFIRMED" && b.status !== "COMPLETED") return sum;
                const p = parseFloat(b.total_price);
                return !isNaN(p) ? sum + p : sum;
            }, 0),
        [bookings]
    );

    // ─── Revenue trend (7 days) ────────────────────────────────────
    const revenueChartData: IChartProps = useMemo(() => {
        const days = lastNDays(7);
        const byDay: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));

        bookings.forEach((b: any) => {
            const k = dayKey(b.created_at);
            if (k in byDay && (b.status === "CONFIRMED" || b.status === "COMPLETED")) {
                byDay[k] += parseFloat(b.total_price) || 0;
            }
        });

        return {
            chartTitle: "Revenue",
            lineChartData: [
                {
                    legend: "Revenue",
                    data: days.map((d) => ({ x: new Date(d + "T00:00:00"), y: byDay[d] })),
                    color: "#eab05e",
                },
            ] as ILineChartPoints[],
        };
    }, [bookings]);

    // ─── Bookings by status (last 7 days) ──────────────────────────
    const bookingsBarData: IGroupedVerticalBarChartData[] = useMemo(() => {
    const days = lastNDays(7);

    type StatusCounts = { CONFIRMED: number; PENDING: number; CANCELLED: number };

    const counts: Record<string, StatusCounts> = {};
    days.forEach((d) => {
        counts[d] = { CONFIRMED: 0, PENDING: 0, CANCELLED: 0 };
    });

    bookings.forEach((b: any) => {
        const k = dayKey(b.created_at);
        const bucket = counts[k];
        if (!bucket) return;
        if (b.status === "CONFIRMED") bucket.CONFIRMED++;
        else if (b.status === "PENDING") bucket.PENDING++;
        else if (b.status === "CANCELLED") bucket.CANCELLED++;
    });

    return days.map((d) => {
        const bucket = counts[d] ?? { CONFIRMED: 0, PENDING: 0, CANCELLED: 0 };
        return {
            name: dayLabel(d),
            series: [
                {
                    key: "Confirmed",
                    legend: "Confirmed",          // ← REQUIRED
                    data: bucket.CONFIRMED,
                    color: "#10b981",
                },
                {
                    key: "Pending",
                    legend: "Pending",            // ← REQUIRED
                    data: bucket.PENDING,
                    color: "#eab05e",
                },
                {
                    key: "Cancelled",
                    legend: "Cancelled",          // ← REQUIRED
                    data: bucket.CANCELLED,
                    color: "#e11d48",
                },
            ],
        };
    });
}, [bookings]);
    // ─── Genre distribution ────────────────────────────────────────
    const genreChartData: IChartProps = useMemo(() => {
        const counts: Record<string, number> = {};
        movies.forEach((m: any) => {
            if (!m.genre) return;
            counts[m.genre] = (counts[m.genre] ?? 0) + 1;
        });
        const data: IChartDataPoint[] = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([genre, count], i) => ({
                legend: genre,
                data: count,
                color: COLORS[i % COLORS.length],
            }));
        return { chartTitle: "Movies by Genre", chartData: data };
    }, [movies]);

    // ─── Recent bookings (5) ───────────────────────────────────────
    const recentBookings = useMemo(
        () =>
            [...bookings]
                .sort(
                    (a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .slice(0, 5),
        [bookings]
    );

    return (
        <div className="dash-content db-page">
            {/* ── Hero Header ─────────────────────────────────────── */}
            <header className="db-hero">
                <div className="db-hero-left">
                    <div className="db-hero-badge">
                        <SparkleRegular fontSize={13} />
                        <span>Dashboard</span>
                    </div>
                    <h1 className="db-hero-title">
                        {getGreeting()}, <span className="db-hero-name">{user?.username ?? "Admin"}</span>
                    </h1>
                    <p className="db-hero-sub">
                        Here's a quick look at your cinema's activity today.
                    </p>
                </div>

                <div className="db-hero-meta">
                    <ClockRegular fontSize={14} />
                    <span>
                        {new Date().toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </header>

            {isLoading ? (
                <div className="db-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading your dashboard...</span>
                </div>
            ) : (
                <>
                    {/* ── KPI Grid ────────────────────────────────── */}
                    <section className="db-kpi-grid">
                        <KpiCard
                            label="Total Movies"
                            value={totalMovies}
                            icon={<Video16Regular />}
                            color="#e11d48"
                            hint="In your library"
                        />
                        <KpiCard
                            label="Total Showtimes"
                            value={totalShowtimes}
                            icon={<CalendarLtrRegular />}
                            color="#eab05e"
                            hint="Scheduled screenings"
                        />
                        <KpiCard
                            label="Total Bookings"
                            value={totalBookings}
                            icon={<BookmarkRegular />}
                            color="#8b5cf6"
                            hint="All-time reservations"
                        />
                        <KpiCard
                            label="Total Revenue"
                            value={`$${totalRevenue.toFixed(2)}`}
                            icon={<MoneyRegular />}
                            color="#10b981"
                            hint="Confirmed bookings"
                        />
                    </section>

                    {/* ── Charts Row 1 ────────────────────────────── */}
                    <section className="db-grid">
                        {/* Revenue Line Chart */}
                        <div className="db-card db-card-wide">
                            <div className="db-card-head">
                                <div>
                                    <h3 className="db-card-title">Revenue Overview</h3>
                                    <p className="db-card-sub">Daily earnings from confirmed bookings</p>
                                </div>
                                <span className="db-pill db-pill-gold">
                                    <ArrowTrendingRegular fontSize={12} />
                                    Last 7 days
                                </span>
                            </div>
                            <div className="db-chart-wrap">
                                <LineChart
                                    data={revenueChartData}
                                    width={820}
                                    height={260}
                                    hideLegend={true}
                                />
                            </div>
                        </div>

                        {/* Genre Donut */}
                        <div className="db-card">
                            <div className="db-card-head">
                                <div>
                                    <h3 className="db-card-title">Genre Mix</h3>
                                    <p className="db-card-sub">Distribution by category</p>
                                </div>
                            </div>
                            <div className="db-chart-wrap db-chart-center">
                                <DonutChart
                                    data={genreChartData}
                                    width={280}
                                    height={240}
                                    innerRadius={62}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ── Charts Row 2: Bookings by Status ────────── */}
                    <section className="db-grid">
                        <div className="db-card db-card-wide">
                            <div className="db-card-head">
                                <div>
                                    <h3 className="db-card-title">Bookings by Status</h3>
                                    <p className="db-card-sub">
                                        Confirmed, pending, and cancelled per day
                                    </p>
                                </div>
                                <span className="db-pill db-pill-gold">Last 7 days</span>
                            </div>
                            <div className="db-chart-wrap">
                                <GroupedVerticalBarChart
                                    data={bookingsBarData}
                                    width={820}
                                    height={260}
                                    barwidth={20}
                                />
                            </div>
                        </div>

                        {/* Recent activity / status summary */}
                        <div className="db-card">
                            <div className="db-card-head">
                                <div>
                                    <h3 className="db-card-title">Status Summary</h3>
                                    <p className="db-card-sub">Breakdown of all bookings</p>
                                </div>
                            </div>
                            <div className="db-status-list">
                                {(
                                    [
                                        "CONFIRMED",
                                        "PENDING",
                                        "COMPLETED",
                                        "CANCELLED",
                                        "EXPIRED",
                                    ] as const
                                ).map((status) => {
                                    const count = bookings.filter(
                                        (b: any) => b.status === status
                                    ).length;
                                    const pct = totalBookings
                                        ? Math.round((count / totalBookings) * 100)
                                        : 0;
                                    return (
                                        <div key={status} className="db-status-row">
                                            <div className="db-status-head">
                                                <span
                                                    className={`badge-soft ${
                                                        statusClass[status] ?? "warning"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                                <span className="db-status-count">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="db-status-bar">
                                                <div
                                                    className="db-status-bar-fill"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background:
                                                            status === "CONFIRMED"
                                                                ? "#10b981"
                                                                : status === "PENDING"
                                                                ? "#eab05e"
                                                                : status === "COMPLETED"
                                                                ? "#8b5cf6"
                                                                : "#e11d48",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── Recent Bookings ─────────────────────────── */}
                    <section className="db-grid">
                        <div className="db-card db-card-full">
                            <div className="db-card-head">
                                <div>
                                    <h3 className="db-card-title">Recent Bookings</h3>
                                    <p className="db-card-sub">
                                        Latest reservations from your customers
                                    </p>
                                </div>
                            </div>

                            {recentBookings.length === 0 ? (
                                <div className="db-empty">
                                    <BookmarkRegular fontSize={32} />
                                    <div className="db-empty-title">No bookings yet</div>
                                    <div className="db-empty-text">
                                        Once customers start booking tickets, they'll appear
                                        here.
                                    </div>
                                </div>
                            ) : (
                                <div className="recent-bookings">
                                    {recentBookings.map((b: any) => {
                                        const movie = b.showtime_detail?.movie_detail;
                                        const screen = b.showtime_detail?.screen_detail;
                                        const seatLabels =
                                            b.seats
                                                ?.map(
                                                    (s: any) =>
                                                        `${s.seat_detail?.row ?? ""}${
                                                            s.seat_detail?.number ?? ""
                                                        }`
                                                )
                                                .join(", ") ?? "";

                                        return (
                                            <div className="recent-row" key={b.id}>
                                                <div className="recent-code">
                                                    {b.booking_code ?? `#${b.id}`}
                                                </div>
                                                <div className="recent-info">
                                                    <div className="recent-user">
                                                        {b.username}
                                                    </div>
                                                    <div className="recent-meta">
                                                        {movie?.title} ·{" "}
                                                        {screen?.theater_name} ·{" "}
                                                        {screen?.name}
                                                    </div>
                                                </div>
                                                <div className="recent-seats">
                                                    {seatLabels || "—"}
                                                </div>
                                                <div className="recent-price">
                                                    {fmtPrice(b.total_price)}
                                                </div>
                                                <span
                                                    className={`badge-soft ${
                                                        statusClass[b.status] ?? "warning"
                                                    }`}
                                                >
                                                    {b.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

// ─── KPI Card ───────────────────────────────────────────────────────
function KpiCard({
    label,
    value,
    icon,
    color,
    hint,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    hint?: string;
}) {
    return (
        <div className="db-kpi">
            <div className="db-kpi-icon" style={{ color, background: `${color}14` }}>
                {icon}
            </div>
            <div className="db-kpi-body">
                <div className="db-kpi-label">{label}</div>
                <div className="db-kpi-value">{value}</div>
                {hint && <div className="db-kpi-hint">{hint}</div>}
            </div>
            <div className="db-kpi-glow" style={{ background: color }} />
        </div>
    );
}

export default DashboardPage;