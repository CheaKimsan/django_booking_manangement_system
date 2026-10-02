import ActionCell from "./ActionCell";
import { Theater } from "../../core/model";
import { Column } from "../../../../_shared/MainTable";

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

export function columns({
    onEdit,
    onDelete,
    onToggleActive,
}: {
    onEdit: (row: Theater) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}): Column<Theater>[] {
    return [
        {
            title: "No.",
            key: "no",
            align: "center",
            width: "60px",
            render: (_row, i) => <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>,
        },
        {
            title: "Cinema",
            key: "name",
            render: (t) => (
                <div className="user-info-sm">
                    <span className="user-name">{t.name}</span>
                </div>
            ),
        },
        {
            title: "City",
            key: "city",
            render: (t) => (
                <div className="user-info-sm">
                    <span className="user-name">{t.city}</span>
                    <span className="user-email">{t.address}</span>
                </div>
            ),
        },
        {
            title: "Manager",
            key: "manager",
            render: (t) => (
                <span style={{ color: "var(--text-muted)" }}>{t.manager_name || <Dash />}</span>
            ),
        },
        {
            title: "Screens",
            key: "screens",
            align: "center",
            render: (t) => {
                const count = t.screens?.length ?? 0;
                return (
                    <span style={{ color: "var(--text-muted)" }}>
                        {count > 0 ? `${count} screen${count !== 1 ? "s" : ""}` : <Dash />}
                    </span>
                );
            },
        },
        {
            title: "Status",
            key: "status",
            render: (t) => (
                <span className={`badge-soft ${t.is_active ? "success" : "danger"}`}>
                    {t.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "",
            key: "actions",
            align: "right",
            width: "60px",
            render: (t) => (
                <ActionCell row={t} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
            ),
        },
    ];
}