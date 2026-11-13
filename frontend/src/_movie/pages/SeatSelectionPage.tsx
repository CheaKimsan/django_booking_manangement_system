import {useState, useMemo} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useQuery, useMutation} from "@tanstack/react-query";
import {
    ArrowLeftRegular,
    ArrowRightRegular,
    ClockRegular,
    CalendarLtrRegular,
    LocationRegular,
    MoneyRegular,
} from "@fluentui/react-icons";

import {getShowtime} from "../../app/modules/showtimes/core/request";
import {getScreenSeats} from "../../app/modules/screen/core/screenService";
import {getBookedSeatIds, createBooking} from "../../app/modules/booking/core/bookingService";
import type {Showtime} from "../../app/modules/showtimes/core/model";
import type {Seat} from "../../app/modules/screen/core/model";

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const fmtPrice = (price: string | number) => {
    const n = typeof price === "string" ? parseFloat(price) : price;
    return `$${n.toFixed(2)}`;
};

const SEAT_TYPES: Record<
    string,
    { label: string; multiplier: number; color: string }
> = {
    REGULAR: {label: "Regular", multiplier: 1.0, color: "#7c8ba1"},
    VIP: {label: "VIP", multiplier: 1.5, color: "#a78bfa"},
    PREMIUM: {label: "Premium", multiplier: 2.0, color: "#eab05e"},
    COUPLE: {label: "Couple", multiplier: 2.2, color: "#fb7185"},
};

export default function SeatSelectionPage() {
    const {showtimeId} = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const id = Number(showtimeId);

    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);


    const {data: showtime, isLoading: loadingShowtime} = useQuery<Showtime>({
        queryKey: ["showtime", id],
        queryFn: () => getShowtime(id),
        enabled: !!id,
    });

    const {data: seats = [], isLoading: loadingSeats} = useQuery<Seat[]>({
        queryKey: ["screen-seats", showtime?.screen_detail?.id],
        queryFn: () => getScreenSeats(showtime!.screen_detail.id),
        enabled: !!showtime?.screen_detail?.id,
    });

    const {data: bookedSeatIds = [], isLoading: loadingBooked} = useQuery<
        number[]
    >({
        queryKey: ["booked-seats", id],
        queryFn: () => getBookedSeatIds(id),
        enabled: !!id,
        refetchInterval: 15_000, // refresh every 15s
    });

    const seatsByRow = useMemo(() => {
        const grouped: Record<string, Seat[]> = {};
        seats.forEach((seat) => {
            if (!grouped[seat.row]) grouped[seat.row] = [];
            grouped[seat.row].push(seat);
        });
        Object.values(grouped).forEach((row) =>
            row.sort((a, b) => a.number - b.number)
        );
        return grouped;
    }, [seats]);

    const rows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

    // ── Selected seat details ────────────────────────────────────
    const selectedSeats = useMemo(
        () => seats.filter((s) => selectedSeatIds.includes(s.id)),
        [seats, selectedSeatIds]
    );

    // ── Total price with per-type multiplier ─────────────────────
    const basePrice = showtime ? parseFloat(showtime.price) : 0;

    const totalPrice = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => {
            const multiplier = SEAT_TYPES[seat.seat_type]?.multiplier ?? 1;
            return sum + basePrice * multiplier;
        }, 0);
    }, [selectedSeats, basePrice]);

    // ── Handlers ─────────────────────────────────────────────────
    const toggleSeat = (seatId: number) => {
        if (bookedSeatIds.includes(seatId)) return;
        setSelectedSeatIds((prev) =>
            prev.includes(seatId)
                ? prev.filter((s) => s !== seatId)
                : [...prev, seatId]
        );
    };

    const createMutation = useMutation({
        mutationFn: () =>
            createBooking({showtime: id, seat_ids: selectedSeatIds}),
        onSuccess: (booking: any) => {
            // Redirect to the payment page instead of review
            navigate(`/booking/${booking.id}/payment`);
        },
    });

    const handleContinue = () => {
        if (selectedSeatIds.length === 0) return;
        createMutation.mutate();
    };

    // ── Loading ─────────────────────────────────────────────────
    if (loadingShowtime || loadingSeats || loadingBooked) {
        return (
            <div className="ss-page">
                <div className="hp-loading">
                    <div className="db-loading-spinner"/>
                    <span>Loading seats...</span>
                </div>
            </div>
        );
    }

    if (!showtime) {
        return (
            <div className="ss-page">
                <div className="hp-error">Showtime not found.</div>
                <button className="nv-pill-btn" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    const movie = showtime.movie_detail;
    const screen = showtime.screen_detail;

    const apiError =
        (createMutation.error as any)?.response?.data?.seat_ids?.[0] ||
        (createMutation.error as any)?.response?.data?.non_field_errors?.[0] ||
        (createMutation.error as any)?.response?.data?.detail ||
        null;

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="ss-page">
            {/* ── Back ──────────────────────────────────── */}
            <button className="sd-back" onClick={() => navigate(-1)}>
                <ArrowLeftRegular fontSize={14}/>
                Back
            </button>

            {/* ── Movie header ──────────────────────────── */}
            <section className="ss-hero">
                <div className="ss-poster">
                    {movie.poster ? (
                        <img src={movie.poster} alt={movie.title}/>
                    ) : (
                        <div className="ss-poster-placeholder">
                            {movie.title.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="ss-hero-info">
                    <h1 className="ss-title">{movie.title}</h1>

                    <div className="ss-meta">
                        <div className="ss-meta-row">
                            <LocationRegular fontSize={15}/>
                            <span>
                                <strong>{screen.theater_name}</strong> ·{" "}
                                {screen.name}
                            </span>
                        </div>
                        <div className="ss-meta-row">
                            <CalendarLtrRegular fontSize={15}/>
                            <span>{fmtDateTime(showtime.start_time)}</span>
                        </div>
                        <div className="ss-meta-row">
                            <ClockRegular fontSize={15}/>
                            <span>{movie.duration_min} min</span>
                        </div>
                        <div className="ss-meta-row">
                            <MoneyRegular fontSize={15}/>
                            <span>
                                <strong>{fmtPrice(showtime.price)}</strong> base
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Screen curve ─────────────────────────── */}
            <div className="ss-screen-wrap">
                <div className="ss-screen-bar"/>
                <div className="ss-screen-label">SCREEN THIS WAY</div>
            </div>

            {/* ── Seat grid ────────────────────────────── */}
            <section className="ss-grid-wrap">
                {rows.length === 0 ? (
                    <div className="hp-empty">
                        No seats configured for this screen.
                    </div>
                ) : (
                    <div className="ss-grid">
                        {rows.map((row) => (
                            <div className="ss-row" key={row}>
                                <span className="ss-row-label">{row}</span>

                                <div className="ss-seats">
                                    {seatsByRow[row].map((seat) => {
                                        const isBooked =
                                            bookedSeatIds.includes(seat.id);
                                        const isSelected =
                                            selectedSeatIds.includes(seat.id);
                                        const typeKey =
                                            seat.seat_type.toLowerCase();

                                        return (
                                            <button
                                                key={seat.id}
                                                type="button"
                                                className={`ss-seat type-${typeKey} ${
                                                    isBooked ? "is-booked" : ""
                                                } ${
                                                    isSelected ? "is-selected" : ""
                                                }`}
                                                disabled={isBooked}
                                                onClick={() =>
                                                    toggleSeat(seat.id)
                                                }
                                                title={`${seat.row}${seat.number} · ${
                                                    SEAT_TYPES[seat.seat_type]
                                                        ?.label ?? seat.seat_type
                                                } · ${fmtPrice(
                                                    basePrice *
                                                    (SEAT_TYPES[
                                                        seat.seat_type
                                                        ]?.multiplier ?? 1)
                                                )}${isBooked ? " · Booked" : ""}`}
                                            >
                                                {seat.number}
                                            </button>
                                        );
                                    })}
                                </div>

                                <span className="ss-row-label">{row}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Legend ───────────────────────────────── */}
            <div className="ss-legend">
                {Object.entries(SEAT_TYPES).map(([key, val]) => (
                    <span className="ss-legend-item" key={key}>
                        <span
                            className={`ss-legend-dot type-${key.toLowerCase()}`}
                        />
                        <span>
                            {val.label}
                            {val.multiplier !== 1 && (
                                <span className="ss-legend-mult">
                                    {" "}
                                    × {val.multiplier}
                                </span>
                            )}
                        </span>
                    </span>
                ))}
                <span className="ss-legend-item">
                    <span className="ss-legend-dot is-selected"/>
                    Selected
                </span>
                <span className="ss-legend-item">
                    <span className="ss-legend-dot is-booked"/>
                    Booked
                </span>
            </div>

            {/* ── Error ────────────────────────────────── */}
            {apiError && (
                <div className="error-box" style={{marginBottom: 20}}>
                    {apiError}
                </div>
            )}

            {/* ── Sticky footer ────────────────────────── */}
            <div className="ss-footer">
                <div className="ss-footer-info">
                    <div className="ss-footer-label">
                        {selectedSeatIds.length === 0
                            ? "Select seats to continue"
                            : `${selectedSeatIds.length} seat${
                                selectedSeatIds.length !== 1 ? "s" : ""
                            } selected`}
                    </div>

                    {selectedSeats.length > 0 && (
                        <div className="ss-footer-chips">
                            {selectedSeats.map((s) => (
                                <span
                                    key={s.id}
                                    className="ss-seat-chip"
                                    onClick={() => toggleSeat(s.id)}
                                >
                                    {s.row}
                                    {s.number}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="ss-footer-total">
                        {fmtPrice(totalPrice)}
                    </div>
                </div>

                <button
                    className="ss-continue-btn"
                    disabled={
                        selectedSeatIds.length === 0 ||
                        createMutation.isPending
                    }
                    onClick={handleContinue}
                >
                    {createMutation.isPending ? (
                        <>
                            <span className="spinner-border spinner-border-sm"/>
                            Reserving...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRightRegular fontSize={16}/>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}