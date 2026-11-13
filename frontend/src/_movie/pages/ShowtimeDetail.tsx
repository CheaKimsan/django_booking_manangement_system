import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeftRegular,
    ClockRegular,
    CalendarLtrRegular,
    LocationRegular,
    MoneyRegular,
    SeatRegular,
    PlayCircleRegular,
    PersonRegular,
} from "@fluentui/react-icons";
import { getShowtime } from "../../app/modules/showtimes/core/request";
import { getScreenSeats } from "../../app/modules/screen/core/screenService";
import { getBookedSeatIds } from "../../app/modules/booking/core/bookingService";
import type { Showtime } from "../../app/modules/showtimes/core/model";
import type { Seat } from "../../app/modules/screen/core/model";

const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const fmtTimeOnly = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

const fmtPrice = (price: string | number) => {
    const n = typeof price === "string" ? parseFloat(price) : price;
    return `$${n.toFixed(2)}`;
};

const SEAT_TYPES: Record<string, { label: string; color: string }> = {
    REGULAR: { label: "Regular", color: "#7c8ba1" },
    VIP: { label: "VIP", color: "#a78bfa" },
    PREMIUM: { label: "Premium", color: "#eab05e" },
    COUPLE: { label: "Couple", color: "#fb7185" },
};

const ShowtimeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const showtimeId = Number(id);

    // ── Showtime data ──────────────────────────────────────────
    const {
        data: showtime,
        isLoading,
        isError,
    } = useQuery<Showtime>({
        queryKey: ["showtime", showtimeId],
        queryFn: () => getShowtime(showtimeId),
        enabled: !!showtimeId,
    });

    // ── Seats for the screen ───────────────────────────────────
    const { data: seats = [] } = useQuery<Seat[]>({
        queryKey: ["screen-seats", showtime?.screen_detail?.id],
        queryFn: () => getScreenSeats(showtime!.screen_detail.id),
        enabled: !!showtime?.screen_detail?.id,
    });

    // ── Booked seats for this showtime ─────────────────────────
    const { data: bookedSeats = [] } = useQuery<number[]>({
        queryKey: ["booked-seats", showtimeId],
        queryFn: () => getBookedSeatIds(showtimeId),
        enabled: !!showtimeId,
        refetchInterval: 15_000,
    });

    const handleBook = () => {
        navigate(`/booking/${showtimeId}`);
    };

    // ── Loading ────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="sd-page">
                <div className="hp-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading showtime...</span>
                </div>
            </div>
        );
    }

    // ── Error / not found ──────────────────────────────────────
    if (isError || !showtime) {
        return (
            <div className="sd-page">
                <div className="hp-error">
                    Could not load this showtime. Try going back.
                </div>
                <button className="nv-pill-btn" onClick={() => navigate(-1)}>
                    <ArrowLeftRegular fontSize={14} />
                    Back
                </button>
            </div>
        );
    }

    const movie = showtime.movie_detail;
    const screen = showtime.screen_detail;

    const totalSeats = seats.length;
    const availableSeats = seats.filter((s) => !bookedSeats.includes(s.id)).length;
    const soldOut = totalSeats > 0 && availableSeats === 0;
    const occupancy = totalSeats
        ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
        : 0;

    // Group seats by row for the preview
    const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {});
    Object.values(seatsByRow).forEach((row) =>
        row.sort((a, b) => a.number - b.number)
    );
    const rows = Object.keys(seatsByRow).sort();

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="sd-page">
            {/* ── Back link ──────────────────────────────── */}
            <button className="sd-back" onClick={() => navigate(-1)}>
                <ArrowLeftRegular fontSize={14} />
                Back
            </button>

            {/* ── Movie hero ─────────────────────────────── */}
            <section className="sd-hero">
                <div className="sd-poster">
                    {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} />
                    ) : (
                        <div className="sd-poster-placeholder">
                            {movie.title.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="sd-movie-info">
                    <span className="sd-badge">
                        <PlayCircleRegular fontSize={13} />
                        Showtime
                    </span>

                    <h1 className="sd-movie-title">{movie.title}</h1>

                    <div className="sd-movie-tags">
                        <span className="sd-tag">{movie.genre}</span>
                        <span className="sd-tag">{movie.language}</span>
                        <span className="sd-tag">
                            <ClockRegular fontSize={12} />
                            {movie.duration_min} min
                        </span>
                    </div>

                    <div className="sd-meta">
                        <div className="sd-meta-row">
                            <CalendarLtrRegular fontSize={16} />
                            <span>{fmtDateTime(showtime.start_time)}</span>
                        </div>
                        <div className="sd-meta-row">
                            <LocationRegular fontSize={16} />
                            <span>
                                <strong>{screen.theater_name}</strong> ·{" "}
                                {screen.name}
                            </span>
                        </div>
                        <div className="sd-meta-row">
                            <MoneyRegular fontSize={16} />
                            <span>
                                <strong>{fmtPrice(showtime.price)}</strong> per seat
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Availability bar ──────────────────────── */}
            <section className="sd-availability">
                <div className="sd-avail-head">
                    <div className="sd-avail-left">
                        <SeatRegular fontSize={18} />
                        <div>
                            <div className="sd-avail-count">
                                {totalSeats === 0 ? (
                                    <>This screen has no seats configured yet</>
                                ) : (
                                    <>
                                        <strong>{availableSeats}</strong> of {totalSeats} seats available
                                    </>
                                )}
                            </div>
                            <div className="sd-avail-sub">
                                {soldOut
                                    ? "This showtime is sold out"
                                    : `${occupancy}% booked`}
                            </div>
                        </div>
                    </div>

                    <span
                        className={`badge-soft ${
                            totalSeats === 0
                                ? "warning"
                                : soldOut
                                ? "danger"
                                : occupancy > 70
                                ? "warning"
                                : "success"
                        }`}
                    >
                        {totalSeats === 0
                            ? "NO SEATS"
                            : soldOut
                            ? "SOLD OUT"
                            : occupancy > 70
                            ? "FILLING FAST"
                            : "AVAILABLE"}
                    </span>
                </div>

                {/* Occupancy bar */}
                <div className="sd-avail-bar">
                    <div
                        className="sd-avail-bar-fill"
                        style={{
                            width: `${occupancy}%`,
                            background: soldOut
                                ? "#fb7185"
                                : occupancy > 70
                                ? "#fbbf24"
                                : "#34d399",
                        }}
                    />
                </div>
            </section>

            {/* ── Seat preview ──────────────────────────── */}
            <section className="sd-seat-section">
                <h2 className="sd-section-title">Seat Preview</h2>

                {rows.length === 0 ? (
                    <div className="hp-empty">No seats configured for this screen.</div>
                ) : (
                    <>
                        {/* Screen curve */}
                        <div className="sd-screen-wrap">
                            <div className="sd-screen-bar" />
                            <div className="sd-screen-label">SCREEN THIS WAY</div>
                        </div>

                        {/* Seat grid */}
                        <div className="sd-seat-grid">
                            {rows.map((row) => (
                                <div className="sd-seat-row" key={row}>
                                    <span className="sd-row-label">{row}</span>
                                    <div className="sd-seat-group">
                                        {seatsByRow[row].map((seat) => {
                                            const isBooked = bookedSeats.includes(seat.id);
                                            const typeKey = seat.seat_type.toLowerCase();
                                            return (
                                                <span
                                                    key={seat.id}
                                                    className={`sd-seat type-${typeKey} ${
                                                        isBooked ? "is-booked" : ""
                                                    }`}
                                                    title={`${seat.row}${seat.number} · ${
                                                        SEAT_TYPES[seat.seat_type]?.label ??
                                                        seat.seat_type
                                                    }${isBooked ? " · Booked" : ""}`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="sd-row-label">{row}</span>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="sd-legend">
                            {Object.entries(SEAT_TYPES).map(([key, val]) => (
                                <span className="sd-legend-item" key={key}>
                                    <span
                                        className={`sd-legend-dot type-${key.toLowerCase()}`}
                                    />
                                    {val.label}
                                </span>
                            ))}
                            <span className="sd-legend-item">
                                <span className="sd-legend-dot is-booked" />
                                Booked
                            </span>
                        </div>

                        {/* Summary text */}
                        <div className="sd-seat-summary">
                            {totalSeats} seats · {availableSeats} available ·{" "}
                            {totalSeats - availableSeats} booked
                        </div>
                    </>
                )}
            </section>

            {/* ── Sticky Book Bar ────────────────────────── */}
            <div className="sd-book-bar">
                <div className="sd-book-info">
                    <div className="sd-book-price">
                        {fmtPrice(showtime.price)}
                        <span className="sd-book-price-label"> / seat</span>
                    </div>
                    <div className="sd-book-time">
                        {fmtTimeOnly(showtime.start_time)} · {screen.name}
                    </div>
                </div>

                <button
                    className="sd-book-btn"
                    onClick={handleBook}
                    disabled={soldOut || totalSeats === 0}
                >
                    {totalSeats === 0
                        ? "Not Available"
                        : soldOut
                        ? "Sold Out"
                        : "Select Seats"}
                    {!soldOut && totalSeats > 0 && (
                        <ArrowLeftRegular
                            fontSize={16}
                            style={{ transform: "rotate(180deg)" }}
                        />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ShowtimeDetail;