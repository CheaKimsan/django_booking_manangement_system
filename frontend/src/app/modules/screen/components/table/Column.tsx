import ScreenActionCell from "./ActionCell";
import type { Screen } from "../../core/model";
import type { Theater } from "../../../cinema/core/model";
import type { Column } from "../../../../_shared/MainTable";

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

export function columns({
    theaters,
    onView,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    theaters: Theater[];
    onView: (row: Screen) => void;
    onEdit: (row: Screen) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive?: (id: number, active: boolean) => void | Promise<void>;
}): Column<Screen>[] {
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
            title: "Screen Name",
            key: "name",
            width: "180px",
            render: (s) => (
                <span style={{ color: "var(--text-light)", fontWeight: 600 }}>
                    {s.name || <Dash />}
                </span>
            ),
        },
        {
            title: "Theater",
            key: "theater",
            width: "180px",
            render: (s) => {
                const name =
                    (s as any).theater_name ??
                    theaters.find((t) => t.id === s.theater)?.name;
                return (
                    <span style={{ color: "var(--text-muted)" }}>
                        {name || <Dash />}
                    </span>
                );
            },
        },
        {
            title: "Layout",
            key: "layout",
            width: "120px",
            render: (s) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {s.total_rows} × {s.seats_per_row}
                </span>
            ),
        },
        {
            title: "Total Seats",
            key: "total_seats",
            width: "110px",
            align: "center",
            render: (s) => {
                const count = s.seats?.length ?? s.total_rows * s.seats_per_row;
                return (
                    <span className="badge-soft customer" style={{ fontWeight: 700 }}>
                        {count}
                    </span>
                );
            },
        },
        {
            title: "Seat Preview",
            key: "preview",
            width: "160px",
            render: (s) => (
                <div className="screen-preview-mini">
                    {Array.from({ length: Math.min(s.total_rows, 6) }).map(
                        (_, r) => (
                            <div key={r} className="screen-preview-row">
                                {Array.from({
                                    length: Math.min(s.seats_per_row, 10),
                                }).map((__, c) => (
                                    <span
                                        key={c}
                                        className="screen-preview-seat mini"
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: "110px",
            render: (s) => (
                <span
                    className={`badge-soft ${
                        s.is_active !== false ? "success" : "danger"
                    }`}
                >
                    {s.is_active !== false ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            align: "right",
            width: "60px",
            render: (s) => (
                <ScreenActionCell
                    row={s}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                />
            ),
        },
    ];
}