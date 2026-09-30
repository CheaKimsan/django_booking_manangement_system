import ActionCell from "./ActionCell";
import { User } from "../../core/model";
import { Column } from "../../../../_shared/MainTable";
import UserAvatar from "../../../../_shared/UserAvatar";

const Dash = () => <span style={{ color: "var(--text-dim)" }}>—</span>;

function fmtRelative(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function columns({
  onEdit,
  onDelete,
  onToggleActive,
}: {
  onEdit: (row: User) => void;
  onDelete: (id: number) => void | Promise<void>;
  onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}): Column<User>[] {
  return [
    {
      title: "No.",
      key: "no",
      align: "center",
      width: "60px",
      render: (_row, i) => <span style={{ color: "var(--text-muted)" }}>{i + 1}</span>,
    },
    {
      title: "User",
      key: "name",
      render: (u) => {
        const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username;
        return (
          <div className="user-cell">
            <UserAvatar
              firstName={u.first_name}
              lastName={u.last_name}
              username={u.username}
              profilePicture={u.profile_picture}
            />
            <div className="user-info-sm">
              <span className="user-name">{name}</span>
              {u.email && <span className="user-email">{u.email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: "Phone",
      key: "phone",
      render: (u) => (
        <span style={{ color: "var(--text-muted)" }}>
          {u.phone_number || <Dash />}
        </span>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: "150px",
      render: (u) => {
        // Map roles to our new CSS badge classes
        let badgeClass = "badge-soft customer";
        if (u.role === "ADMIN") badgeClass = "badge-soft admin";
        else if (u.role === "THEATER_MANAGER") badgeClass = "badge-soft warning";

        return (
          <span className={badgeClass}>
            {u.role.replace("_", " ")}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: "110px",
      render: (u) => (
        <span className={`badge-soft ${u.is_active ? "success" : "danger"}`}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Last Login",
      key: "last_login",
      render: (u) => (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {fmtRelative(u.last_login)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      width: "60px",
      render: (u) => (
        <ActionCell row={u} onEdit={onEdit} onDelete={onDelete} onToggleActive={onToggleActive} />
      ),
    },
  ];
}