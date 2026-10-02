import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    EditRegular,
    PersonDeleteRegular,
    DeleteRegular,
    MoreVerticalRegular
} from "@fluentui/react-icons";
import { Showtime } from "../../core/model"; // <-- UPDATE THIS PATH to your actual model location

interface ActionCellProps {
    row: Showtime;
    onEdit: (row: Showtime) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive: (id: number, active: boolean) => void | Promise<void>;
}

export default function ActionCell({
    row, onEdit, onDelete, onToggleActive,
}: ActionCellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const computeCoords = () => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 4,
            left: rect.right + window.scrollX - 180, // 180 = menu width
        });
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) computeCoords();
        setIsOpen((prev) => !prev);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    useLayoutEffect(() => {
        if (!isOpen) return;
        window.addEventListener("scroll", computeCoords, true);
        window.addEventListener("resize", computeCoords);
        return () => {
            window.removeEventListener("scroll", computeCoords, true);
            window.removeEventListener("resize", computeCoords);
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