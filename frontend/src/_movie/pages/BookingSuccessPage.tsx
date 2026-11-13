import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    CheckmarkCircleRegular,
    CopyRegular,
    CalendarLtrRegular,
    LocationRegular,
    BookmarkRegular,
    HomeRegular,
} from "@fluentui/react-icons";
import { getBookingByCode } from "../../app/modules/booking/core/bookingService";

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const fmtPrice = (p: string | number) =>
    `$${parseFloat(String(p)).toFixed(2)}`;

export default function BookingSuccessPage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const { data: booking, isLoading } = useQuery({
        queryKey: ["booking-code", code],
        queryFn: () => getBookingByCode(code!),
        enabled: !!code,
    });

    // Confetti-ish: brief animate-in
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 50);
        return () => clearTimeout(t);
    }, []);

    const handleCopy = () => {
        if (!booking?.booking_code) return;
        navigator.clipboard.writeText(booking.booking_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading || !booking) {
        return (
            <div className="su-page">
                <div className="hp-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading your booking...</span>
                </div>
            </div>
        );
    }

    const movie = booking.showtime_detail?.movie_detail;
    const screen = booking.showtime_detail?.screen_detail;

    return (
        <div className="su-page">
            <div className={`su-content ${show ? "is-visible" : ""}`}>
                {/* Success icon */}
                <div className="su-icon">
                    <CheckmarkCircleRegular fontSize={48} />
                </div>

                <h1 className="su-title">Booking confirmed!</h1>
                <p className="su-sub">
                    Show this code at the entrance to be scanned.
                </p>

                {/* Booking code card */}
                <div className="su-code-card">
                    <div className="su-code-label">Your booking code</div>
                    <div className="su-code-value">{booking.booking_code}</div>
                    <button className="su-copy-btn" onClick={handleCopy}>
                        {copied ? (
                            <CheckmarkCircleRegular fontSize={14} />
                        ) : (
                            <CopyRegular fontSize={14} />
                        )}
                        {copied ? "Copied" : "Copy code"}
                    </button>
                </div>

                {/* Details */}
                <div className="su-details">
                    <div className="su-row">
                        <BookmarkRegular fontSize={16} />
                        <div>
                            <div className="su-row-label">Movie</div>
                            <div className="su-row-value">{movie?.title}</div>
                        </div>
                    </div>

                    <div className="su-row">
                        <LocationRegular fontSize={16} />
                        <div>
                            <div className="su-row-label">Theater</div>
                            <div className="su-row-value">
                                {screen?.theater_name} · {screen?.name}
                            </div>
                        </div>
                    </div>

                    <div className="su-row">
                        <CalendarLtrRegular fontSize={16} />
                        <div>
                            <div className="su-row-label">Showtime</div>
                            <div className="su-row-value">
                                {fmtDateTime(booking.showtime_detail?.start_time)}
                            </div>
                        </div>
                    </div>

                    <div className="su-row">
                        <BookmarkRegular fontSize={16} />
                        <div>
                            <div className="su-row-label">Seats</div>
                            <div className="su-row-value su-seat-chips">
                                {booking.seats.map((s) => (
                                    <span key={s.id} className="ss-seat-chip">
                                        {s.seat_detail.row}
                                        {s.seat_detail.number}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="su-row su-row-total">
                        <span className="su-row-label">Total</span>
                        <span className="su-row-value-total">
                            {fmtPrice(booking.total_price)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="su-actions">
                    <Link to="/my-bookings" className="nv-pill-btn">
                        <BookmarkRegular fontSize={16} />
                        My Bookings
                    </Link>
                    <Link to="/" className="nv-pill-btn primary">
                        <HomeRegular fontSize={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}