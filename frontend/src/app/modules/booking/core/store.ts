import { create } from "zustand";
import type { Booking } from "./model";

type BookingDrawerMode = "view";
type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "COMPLETED";

type BookingDrawerState = {
    open: boolean;
    booking: Booking | null;
};

type AdminBookingState = {
    search: string;
    statusFilter: StatusFilter;
    page: number;
    pageSize: number;
    drawer: BookingDrawerState;

    setSearch: (q: string) => void;
    setStatusFilter: (s: StatusFilter) => void;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;

    openView: (booking: Booking) => void;
    closeDrawer: () => void;
};

const useAdminBookingStore = create<AdminBookingState>((set) => ({
    search: "",
    statusFilter: "all",
    page: 0,
    pageSize: 10,
    drawer: { open: false, booking: null },

    setSearch: (search) => set({ search, page: 0 }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 0 }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 0 }),

    openView: (booking) => set({ drawer: { open: true, booking } }),
    closeDrawer: () => set((s) => ({ drawer: { ...s.drawer, open: false } })),
}));

export { useAdminBookingStore };
export type { BookingDrawerMode, StatusFilter };