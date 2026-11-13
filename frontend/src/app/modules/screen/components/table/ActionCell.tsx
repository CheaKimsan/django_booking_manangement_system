import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    EyeRegular,
    EditRegular,
    DeleteRegular,
    MoreVerticalRegular,
    PersonDeleteRegular,
} from "@fluentui/react-icons";
import type { Screen } from "../../core/model";

interface Props {
    row: Screen;
    onView: (row: Screen) => void;
    onEdit: (row: Screen) => void;
    onDelete: (id: number) => void | Promise<void>;
    onToggleActive?: (id: number, active: boolean) => void | Promise<void>;
}

export default function ScreenActionCell({
    row,
    onView,
    onEdit,
    onDelete,
    onToggleActive,
}: Props) {
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

    const run = (action: () => void | Promise<void>) => {
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
            <button
                ref={btnRef}
                className="action-btn"
                onClick={handleToggle}
                aria-label="Open actions"
            >
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
                            {/* View — always */}
                            <button
                                className="action-dropdown-item"
                                onClick={() => run(() => onView(row))}
                            >
                                <EyeRegular />
                                View Details
                            </button>

                            {/* Edit */}
                            <button
                                className="action-dropdown-item"
                                onClick={() => run(() => onEdit(row))}
                            >
                                <EditRegular />
                                Edit Screen
                            </button>

                            {/* Toggle active (if handler provided) */}
                            {onToggleActive && (
                                <button
                                    className={`action-dropdown-item ${
                                        row.is_active ? "warning" : ""
                                    }`}
                                    onClick={() =>
                                        run(() =>
                                            onToggleActive(row.id, !row.is_active)
                                        )
                                    }
                                >
                                    <PersonDeleteRegular />
                                    {row.is_active ? "Deactivate" : "Activate"}
                                </button>
                            )}

                            {/* Delete */}
                            <button
                                className="action-dropdown-item danger"
                                onClick={() => run(() => onDelete(row.id))}
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