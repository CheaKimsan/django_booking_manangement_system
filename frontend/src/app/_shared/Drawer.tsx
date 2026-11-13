import { ReactNode, useEffect, useRef } from "react";

export type DrawerProps = {
    open: boolean;
    title: string;
    icon?: ReactNode;
    onClose: () => void;
    footer?: ReactNode;      // pass null/undefined to hide the footer entirely (e.g. view mode)
    width?: number;           // defaults to 440
    children: ReactNode;
    /** Bump this when the drawer's content changes (e.g. a different row,
     *  or mode switching create/edit/view) so the body scroll resets to top. */
    resetScrollKey?: unknown;
};

export default function Drawer({
    open,
    title,
    icon,
    onClose,
    footer,
    width = 440,
    children,
    resetScrollKey,
}: DrawerProps) {
    const bodyRef = useRef<HTMLDivElement>(null);

    // Reset scroll position whenever the drawer opens, or its content changes
    useEffect(() => {
        if (open && bodyRef.current) {
            bodyRef.current.scrollTop = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, resetScrollKey]);

    if (!open) return null;

    return (
        <>
            <div className="drawer-overlay open" onClick={onClose} />

            <div className="drawer-panel open" style={{ width }}>
                <div className="drawer-header">
                    <h3 className="drawer-title">
                        {icon && <span style={{ color: "var(--accent)" }}>{icon}</span>}
                        {title}
                    </h3>
                    <button className="drawer-close" onClick={onClose} aria-label="Close">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="drawer-body" ref={bodyRef}>
                    {children}
                </div>

                {footer && <div className="drawer-footer">{footer}</div>}
            </div>
        </>
    );
}