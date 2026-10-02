import ActionCell from "./ActionCell";
import { Movie } from "../../core/model";
import { Column } from "../../../../_shared/MainTable";

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

function fmtDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function fmtDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function columns({
    onEdit,
    onDelete,
    onToggleActive,
}: {
    onEdit: (row: Movie) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}): Column<Movie>[] {
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
                m.poster ? (
                    <img
                        src={m.poster}
                        alt={m.title}
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 4,
                            background: "var(--surface-2, #334155)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            color: "var(--text-dim)",
                        }}
                    >
                        N/A
                    </div>
                )
            ),
        },
        {
            title: "Title",
            key: "title",
            width: "160px",
            render: (m) => (
                <span style={{ color: "var(--text-light)" }}>{m.title || <Dash />}</span>
            ),
        },
        {
            title: "Language",
            key: "language",
            width: "120px",
            render: (m) => (
                <span style={{ color: "var(--text-muted)" }}>{m.language || <Dash />}</span>
            ),
        },
        {
            title: "Duration",
            key: "duration",
            width: "100px",
            render: (m) => (
                <span style={{ color: "var(--text-muted)" }}>{fmtDuration(m.duration_min)}</span>
            ),
        },
        {
            title: "Genre",
            key: "genre",
            width: "140px",
            render: (m) => (
                <span style={{ color: "var(--text-muted)" }}>{m.genre || <Dash />}</span>
            ),
        },
        {
            title: "Release Date",
            key: "release_date",
            width: "130px",
            render: (m) => (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {fmtDate(m.release_date) ?? <Dash />}
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
                <ActionCell row={m} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
            ),
        },
    ];
}