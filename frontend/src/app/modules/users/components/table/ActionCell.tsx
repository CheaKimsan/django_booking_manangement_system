import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  EditRegular,
  PersonDeleteRegular,
  DeleteRegular,
  MoreVerticalRegular
} from "@fluentui/react-icons";

interface ActionCellProps {
  row: any;
  onEdit: (row: any) => void;
  onDelete: (id: number) => void | Promise<void>;
  onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}

export default function ActionCell({ row, onEdit, onDelete, onToggleActive }: ActionCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        // right-align the menu to the button's right edge
        left: rect.right + window.scrollX - 180, // 180 = menu width below
      });
    }
    setIsOpen((prev) => !prev);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Reposition if the window resizes/scrolls while open
  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 180,
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }} data-no-row-click>
      <button ref={btnRef} className="action-btn" onClick={handleToggle}>
        <MoreVerticalRegular fontSize={18} />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />
            <div
              className="action-dropdown"
              data-no-row-click
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                width: 180,
                zIndex: 9999,
              }}
            >
              <button
                className="action-dropdown-item"
                onClick={() => handleAction(() => onEdit(row))}
              >
                <EditRegular />
                Edit
              </button>

              <button
                className={`action-dropdown-item ${row.is_active ? "warning" : ""}`}
                onClick={() => handleAction(() => onToggleActive(row.id, !row.is_active))}
              >
                <PersonDeleteRegular />
                {row.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                className="action-dropdown-item danger"
                onClick={() => handleAction(() => onDelete(row.id))}
              >
                <DeleteRegular />
                Delete
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}