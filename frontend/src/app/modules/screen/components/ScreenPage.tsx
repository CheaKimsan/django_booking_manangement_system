import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddRegular } from "@fluentui/react-icons";

import { useScreenStore } from "../core/store";
import { columns } from "./table/Column";
import ScreenDrawer from "./form/CreateScreenPage";
import {
    getScreens,
    deleteScreen,
    updateScreen,
} from "../core/screenService";
import { getTheaters } from "../../cinema/core/cinemaService";
import MainTable from "../../../_shared/MainTable";

const ScreensPage = () => {
    const {
        search, setSearch,
        statusFilter, setStatusFilter,
        openCreate, openEdit, openView,
        drawer, closeDrawer,
    } = useScreenStore();
    const queryClient = useQueryClient();

    const [selectedTheater, setSelectedTheater] = useState<number | null>(null);

    // ── Fetch theaters (also used by the drawer dropdown) ──────────
    const { data: theaters = [] } = useQuery({
        queryKey: ["theaters"],
        queryFn: () => getTheaters(),
    });

    // ── Fetch screens ──────────────────────────────────────────────
    const { data: screens = [], isLoading } = useQuery({
        queryKey: ["screens", selectedTheater],
        queryFn: () => getScreens(selectedTheater ?? undefined),
    });

    // ── Client-side filtering ──────────────────────────────────────
    const filtered = useMemo(() => {
        let result = screens;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((s) => s.name.toLowerCase().includes(q));
        }
        if (statusFilter !== "all") {
            const want = statusFilter === "active";
            result = result.filter((s) => s.is_active === want);
        }
        return result;
    }, [screens, search, statusFilter]);

    // ── Mutations ──────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteScreen(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["screens"] }),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: number; active: boolean }) =>
            updateScreen(id, { is_active: active }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["screens"] }),
    });

    // ── Columns (pass theaters so the Theater column can resolve names) ─
    const cols = columns({
        theaters,
        onView: openView,
        onEdit: openEdit,
        onDelete: async (id) => {
            if (!window.confirm("Delete this screen and all its seats?")) return;
            await deleteMutation.mutateAsync(id);
        },
        onToggleActive: async (id, active) => {
            await toggleMutation.mutateAsync({ id, active });
        },
    });

    return (
        <div className="dash-content">
            {/* ── Toolbar ──────────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="search-bar-dark">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search screens..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 220 }}
                        value={selectedTheater ?? ""}
                        onChange={(e) =>
                            setSelectedTheater(
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                    >
                        <option value="">All Theaters</option>
                        {theaters.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Add Screen — always enabled, theater is picked inside the drawer */}
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => openCreate(selectedTheater ?? 0)}
                >
                    <AddRegular fontSize={18} />
                    Add Screen
                </button>
            </div>

            <MainTable
                columns={cols}
                rows={filtered}
                rowKey={(s) => s.id}
                loading={isLoading}
                onRowClick={(s) => openEdit(s)}
            />

            <ScreenDrawer
                open={drawer.open}
                mode={drawer.mode}
                screen={drawer.screen}
                theaterId={drawer.theaterId}
                theaters={theaters}
                onClose={closeDrawer}
                onSave={() =>
                    queryClient.invalidateQueries({ queryKey: ["screens"], exact: false })
                }
            />
        </div>
    );
};

export default ScreensPage;