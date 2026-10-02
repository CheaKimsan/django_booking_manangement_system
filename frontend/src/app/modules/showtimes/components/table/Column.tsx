import { Showtime } from "../../core/model"; // <-- UPDATE THIS PATH to your actual model location
import { Column } from "../../../../_shared/MainTable";
import ActionCell from "./ActionCell"; // <-- UPDATE THIS PATH to your shared MainTable

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

// Format ISO strings into a readable date and time
function fmtDateTime(dateStr: string | null) {
    if (!dateStr) return <Dash />;
    const date = new Date(dateStr);
    return (
        date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        }) +
        ", " +
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

// Format string decimals (e.g., "12.50") into currency
function fmtPrice(priceStr: string | null | undefined) {
    if (!priceStr) return <Dash />;
    const price = parseFloat(priceStr);
    if (isNaN(price)) return <Dash />;
    return `$${price.toFixed(2)}`;
}

export function columns({
    onEdit,
    onDelete,
    onToggleActive,
}: {
    onEdit: (row: Showtime) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}): Column<Showtime>[] {
    return [
        {
            title: "No.",
            key: "no",
            align: "center",
            width: "60px",
            render: (_row, i) => <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>,
        },
        {
            title: "Poster",
            key: "poster",
            width: "70px",
            render: (m) => (
                m.movie_detail?.poster ? (
                    <img
                        src={m.movie_detail.poster}
                        alt={m.movie_detail.title}
                        style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 4 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 40,
                            height: 56,
                            borderRadius: 4,
                            background: "var(--surface-2, #334155)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8,
                            color: "var(--text-dim)",
                        }}
                    >
                        N/A
                    </div>
                )
            ),
        },
        {
            title: "Movie",
            key: "movie",
            width: "180px",
            render: (m) => (
                <span style={{ color: "var(--text-light)", fontWeight: 500 }}>
                    {m.movie_detail?.title || <Dash />}
                </span>
            ),
        },
        {
            title: "Theater",
            key: "theater",
            width: "140px",
            render: (m) => (
                <span style={{ color: "var(--text-muted)" }}>
                    {m.screen_detail?.theater_name || <Dash />}
                </span>
            ),
        },
        {
            title: "Screen",
            key: "screen",
            width: "110px",
            render: (m) => (
                <span style={{ color: "var(--text-muted)" }}>
                    {m.screen_detail?.name || <Dash />}
                </span>
            ),
        },
        {
            title: "Start Time",
            key: "start_time",
            width: "160px",
            render: (m) => (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {fmtDateTime(m.start_time)}
                </span>
            ),
        },
        {
            title: "End Time",
            key: "end_time",
            width: "160px",
            render: (m) => (
                <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    {fmtDateTime(m.end_time)}
                </span>
            ),
        },
        {
            title: "Price",
            key: "price",
            width: "100px",
            render: (m) => (
                <span style={{ color: "var(--text-light)" }}>
                    {fmtPrice(m.price)}
                </span>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: "110px",
            render: (m) => (
                <span className={`badge-soft ${m.is_active ? "success" : "danger"}`}>
                    {m.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            align: "right",
            width: "60px",
            render: (m) => (
                <ActionCell
                    row={m}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                />
            ),
        },
    ];
}