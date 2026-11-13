import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    EyeRegular,
    CheckmarkCircleRegular,
    DismissCircleRegular,
    DeleteRegular,
    MoreVerticalRegular,
} from "@fluentui/react-icons";
import {Booking} from "../../core/model";

interface Props {
    row: Booking;
    onView: (row: Booking) => void;
    onConfirm: (id: number) => void | Promise<void>;
    onCancel: (id: number) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
}

export default function BookingActionCell({
    row,
    onView,
    onConfirm,
    onCancel,
    onDelete,
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

    // ── Status-based rules ────────────────────────────────────────
    const canConfirm = row.status === "PENDING";
    const canCancel =
        row.status === "PENDING" || row.status === "CONFIRMED";

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

                            {/* Confirm — only for PENDING */}
                            {canConfirm && (
                                <button
                                    className="action-dropdown-item"
                                    onClick={() => run(() => onConfirm(row.id))}
                                >
                                    <CheckmarkCircleRegular />
                                    Confirm
                                </button>
                            )}

                            {/* Cancel — PENDING or CONFIRMED */}
                            {canCancel && (
                                <button
                                    className="action-dropdown-item warning"
                                    onClick={() => run(() => onCancel(row.id))}
                                >
                                    <DismissCircleRegular />
                                    Cancel
                                </button>
                            )}

                            {/* Delete — always (admin cleanup) */}
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