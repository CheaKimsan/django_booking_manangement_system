import type { Column } from "../../../../_shared/MainTable";
import {Booking} from "../../core/model";
import BookingActionCell from "./ActionCell"; // adjust path

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

// ─── Format helpers ─────────────────────────────────────────────────
function fmtDateTime(iso: string | null) {
    if (!iso) return <Dash />;
    const d = new Date(iso);
    return (
        d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
        ", " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
}

function fmtPrice(priceStr: string | null | undefined) {
    if (!priceStr) return <Dash />;
    const n = parseFloat(priceStr);
    if (isNaN(n)) return <Dash />;
    return `$${n.toFixed(2)}`;
}

function seatLabel(seat: { row: string; number: number }) {
    return `${seat.row}${seat.number}`;
}

// Map status → CSS badge class
const statusClass: Record<string, string> = {
    PENDING:   "warning",
    CONFIRMED: "success",
    CANCELLED: "danger",
    EXPIRED:   "danger",
    COMPLETED: "admin",
};

// ─── Columns ────────────────────────────────────────────────────────
export function columns({
    onView,
    onConfirm,
    onCancel,
    onDelete,
}: {
    onView: (row: Booking) => void;
    onConfirm: (id: number) => void | Promise<void>;
    onCancel: (id: number) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
}): Column<Booking>[] {
    return [
        {
            title: "No.",
            key: "no",
            align: "center",
            width: "60px",
            render: (_row, i) => (
                <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>
            ),
        },
        {
            title: "Code",
            key: "booking_code",
            width: "140px",
            render: (b) =>
                b.booking_code ? (
                    <span
                        style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "var(--accent-gold)",
                            letterSpacing: "0.5px",
                        }}
                    >
                        {b.booking_code}
                    </span>
                ) : (
                    <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                        #{b.id}
                    </span>
                ),
        },
        {
            title: "Customer",
            key: "customer",
            width: "160px",
            render: (b) => (
                <div className="user-info-sm">
                    <span className="user-name">{b.username}</span>
                    <span className="user-email">user #{b.user}</span>
                </div>
            ),
        },
        {
            title: "Movie",
            key: "movie",
            width: "180px",
            render: (b) => (
                <span style={{ color: "var(--text-light)", fontWeight: 500 }}>
                    {b.showtime_detail?.movie_detail?.title || <Dash />}
                </span>
            ),
        },
        {
            title: "Theater / Screen",
            key: "screen",
            width: "200px",
            render: (b) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {b.showtime_detail?.screen_detail?.theater_name || <Dash />}
                    {" · "}
                    {b.showtime_detail?.screen_detail?.name || <Dash />}
                </span>
            ),
        },
        {
            title: "Showtime",
            key: "start_time",
            width: "160px",
            render: (b) => (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {fmtDateTime(b.showtime_detail?.start_time)}
                </span>
            ),
        },
        {
            title: "Seats",
            key: "seats",
            width: "160px",
            render: (b) => {
                if (!b.seats?.length) return <Dash />;
                const labels = b.seats.map((s) => seatLabel(s.seat_detail));
                const visible = labels.slice(0, 3);
                const remaining = labels.length - visible.length;
                return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {visible.map((label) => (
                            <span
                                key={label}
                                className="bk-seat-chip"
                                style={{ fontSize: "0.7rem", padding: "2px 7px" }}
                            >
                                {label}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    alignSelf: "center",
                                }}
                            >
                                +{remaining}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Total",
            key: "total_price",
            width: "100px",
            render: (b) => (
                <span
                    style={{
                        color: "var(--text-light)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                    }}
                >
                    {fmtPrice(b.total_price)}
                </span>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: "120px",
            render: (b) => (
                <span
                    className={`badge-soft ${statusClass[b.status] ?? "warning"}`}
                >
                    {b.status}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            align: "right",
            width: "60px",
            render: (b) => (
                <BookingActionCell
                    row={b}
                    onView={onView}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            ),
        },
    ];
}