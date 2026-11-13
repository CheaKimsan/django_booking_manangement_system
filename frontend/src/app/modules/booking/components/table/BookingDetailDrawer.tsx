import {
    CheckmarkCircleRegular,
    DismissCircleRegular,
    DeleteRegular,
    BookmarkRegular,
    PersonRegular,
    CalendarLtrRegular,
    LocationRegular,
    MoneyRegular,
} from "@fluentui/react-icons";
import type { Booking } from "../../core/model";

interface Props {
    open: boolean;
    booking: Booking | null;
    onClose: () => void;
    onConfirm?: (id: number) => void | Promise<void>;
    onCancel?: (id: number) => void | Promise<void>;
    onDelete?: (id: number) => void | Promise<void>;
}

const fmtDateTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const fmtPrice = (p: string | null | undefined) => {
    if (!p) return "—";
    const n = parseFloat(p);
    return isNaN(n) ? "—" : `$${n.toFixed(2)}`;
};

const seatLabel = (s: { row: string; number: number }) => `${s.row}${s.number}`;

const statusClass: Record<string, string> = {
    PENDING:   "warning",
    CONFIRMED: "success",
    CANCELLED: "danger",
    EXPIRED:   "danger",
    COMPLETED: "admin",
};

export default function BookingDetailDrawer({
    open,
    booking,
    onClose,
    onConfirm,
    onCancel,
    onDelete,
}: Props) {
    if (!booking) return null;

    const movie = booking.showtime_detail?.movie_detail;
    const screen = booking.showtime_detail?.screen_detail;
    const showtime = booking.showtime_detail;

    const canConfirm = booking.status === "PENDING";
    const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

    return (
        <>
            {/* Backdrop */}
            <div
                className={`drawer-overlay ${open ? "open" : ""}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`drawer-panel ${open ? "open" : ""}`}>
                {/* Header */}
                <div className="drawer-header">
                    <h3 className="drawer-title">
                        <span style={{ color: "var(--accent)" }}>
                            <BookmarkRegular fontSize={20} />
                        </span>
                        Booking Details
                    </h3>
                    <button
                        className="drawer-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="drawer-body">
                    {/* Booking code — highlighted */}
                    <div className="bk-detail-code-box">
                        <div className="bk-detail-code-label">Booking Code</div>
                        <div className="bk-detail-code-value">
                            {booking.booking_code ?? `#${booking.id}`}
                        </div>
                        <span
                            className={`badge-soft ${statusClass[booking.status] ?? "warning"}`}
                            style={{ marginTop: 8 }}
                        >
                            {booking.status}
                        </span>
                    </div>

                    {/* Movie */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">Movie</div>
                        <div className="bk-detail-movie">
                            {movie?.poster && (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="bk-detail-poster"
                                />
                            )}
                            <div className="bk-detail-movie-info">
                                <div className="bk-detail-movie-title">
                                    {movie?.title ?? "—"}
                                </div>
                                <div className="bk-detail-movie-meta">
                                    {movie?.genre} · {movie?.language} · {movie?.duration_min} min
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">Customer</div>
                        <div className="bk-detail-row">
                            <PersonRegular fontSize={15} />
                            <span>
                                <strong>{booking.username}</strong> · user #{booking.user}
                            </span>
                        </div>
                    </div>

                    {/* Showtime */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">Showtime</div>
                        <div className="bk-detail-row">
                            <LocationRegular fontSize={15} />
                            <span>
                                <strong>{screen?.theater_name ?? "—"}</strong> ·{" "}
                                {screen?.name ?? "—"}
                            </span>
                        </div>
                        <div className="bk-detail-row">
                            <CalendarLtrRegular fontSize={15} />
                            <span>{fmtDateTime(showtime?.start_time)}</span>
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">
                            Seats ({booking.seats.length})
                        </div>
                        <div className="bk-detail-seats">
                            {booking.seats.map((s) => (
                                <span key={s.id} className="bk-seat-chip">
                                    {seatLabel(s.seat_detail)}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">Total</div>
                        <div className="bk-detail-total">
                            <MoneyRegular fontSize={18} />
                            <span>{fmtPrice(booking.total_price)}</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bk-detail-section">
                        <div className="bk-detail-section-title">Timeline</div>
                        <div className="bk-detail-timeline">
                            <div className="bk-detail-time-item">
                                <span className="bk-detail-time-label">Created</span>
                                <span className="bk-detail-time-value">
                                    {fmtDateTime(booking.created_at)}
                                </span>
                            </div>
                            {booking.confirmed_at && (
                                <div className="bk-detail-time-item">
                                    <span className="bk-detail-time-label">Confirmed</span>
                                    <span className="bk-detail-time-value">
                                        {fmtDateTime(booking.confirmed_at)}
                                    </span>
                                </div>
                            )}
                            {booking.expires_at && (
                                <div className="bk-detail-time-item">
                                    <span className="bk-detail-time-label">Expires</span>
                                    <span className="bk-detail-time-value">
                                        {fmtDateTime(booking.expires_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="drawer-footer">
                    {canConfirm && onConfirm && (
                        <button
                            className="btn-save"
                            onClick={() => onConfirm(booking.id)}
                        >
                            <CheckmarkCircleRegular fontSize={16} />
                            Confirm
                        </button>
                    )}
                    {canCancel && onCancel && (
                        <button
                            className="btn-cancel"
                            onClick={() => onCancel(booking.id)}
                        >
                            <DismissCircleRegular fontSize={16} />
                            Cancel
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="btn-cancel"
                            style={{ color: "#fb7185" }}
                            onClick={() => onDelete(booking.id)}
                        >
                            <DeleteRegular fontSize={16} />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}