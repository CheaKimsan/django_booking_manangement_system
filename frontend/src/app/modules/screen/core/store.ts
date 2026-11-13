import { create } from "zustand";
import type { Screen } from "./model";

// ─── Types ─────────────────────────────────────────────────────────
type ScreenDrawerMode = "create" | "view" | "edit";
type StatusFilter = "all" | "active" | "inactive";

type ScreenDrawerState = {
    open: boolean;
    mode: ScreenDrawerMode;
    screen: Screen | null;
    /** Which theater the new screen belongs to (used in create mode) */
    theaterId: number | null;
};

type ScreenState = {
    search: string;
    statusFilter: StatusFilter;
    page: number;
    pageSize: number;
    drawer: ScreenDrawerState;

    // ─── Setters ────────────────────────────────────────────────
    setSearch: (q: string) => void;
    setStatusFilter: (status: StatusFilter) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;

    // ─── Drawer actions ─────────────────────────────────────────
    /** Open drawer in create mode for a specific theater */
    openCreate: (theaterId: number) => void;
    /** Open drawer in edit mode for an existing screen */
    openEdit: (screen: Screen) => void;
    /** Open drawer in read-only view mode */
    openView: (screen: Screen) => void;
    /** Close drawer (keeps last state for smooth animation) */
    closeDrawer: () => void;

    // ─── Reset ──────────────────────────────────────────────────
    reset: () => void;
};

// ─── Initial state (reused for reset) ──────────────────────────────
const INITIAL_STATE = {
    search: "",
    statusFilter: "all" as StatusFilter,
    page: 0,
    pageSize: 10,
    drawer: {
        open: false,
        mode: "create" as ScreenDrawerMode,
        screen: null,
        theaterId: null,
    },
};

// ─── Store ─────────────────────────────────────────────────────────
const useScreenStore = create<ScreenState>((set) => ({
    ...INITIAL_STATE,

    setSearch: (search) => set({ search, page: 0 }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 0 }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 0 }),

    openCreate: (theaterId) =>
        set({
            drawer: {
                open: true,
                mode: "create",
                screen: null,
                theaterId,
            },
        }),

    openEdit: (screen) =>
        set({
            drawer: {
                open: true,
                mode: "edit",
                screen,
                theaterId: screen.theater,
            },
        }),

    openView: (screen) =>
        set({
            drawer: {
                open: true,
                mode: "view",
                screen,
                theaterId: screen.theater,
            },
        }),

    closeDrawer: () =>
        set((s) => ({
            drawer: { ...s.drawer, open: false },
        })),

    reset: () => set(INITIAL_STATE),
}));

export type { ScreenDrawerMode, StatusFilter };
export { useScreenStore };