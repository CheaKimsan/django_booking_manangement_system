import React from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useSidebar } from "./core/useSidebar";

type RouteHandle = {
    title?: string;
    subtitle?: string;
    breadcrumb?: { label: string }[];
};

const AppLayout: React.FC = () => {
    const { isOpen, isCollapsed, toggle, close, toggleCollapse } = useSidebar();
    const { pathname } = useLocation();
    const matches = useMatches();

    // Find the deepest match that has a `handle`
    const currentMatch = [...matches].reverse().find((m) => m.handle) as
        | { handle: RouteHandle }
        | undefined;

    const meta: RouteHandle = {
        title: currentMatch?.handle?.title ?? "Dashboard",
        subtitle: currentMatch?.handle?.subtitle,
        breadcrumb: currentMatch?.handle?.breadcrumb,
    };

    React.useEffect(() => {
        close();
    }, [pathname, close]);

    return (
        <div className={`dash-root ${isCollapsed ? "is-collapsed" : ""}`}>
            <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} onClose={close} />

            <div
                className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
                onClick={close}
                aria-hidden="true"
            />

            <div className="dash-main">
                <Header
                    meta={meta}
                    isCollapsed={isCollapsed}
                    onMenuClick={toggle}
                    onCollapseClick={toggleCollapse}
                />

                <main className="dash-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;