import { create } from "zustand";
import type { Theater } from "./model";

type TheaterDrawerMode = "create" | "view" | "edit";
type StatusFilter = "all" | "active" | "inactive";

type TheaterDrawerState = {
  open: boolean;
  mode: TheaterDrawerMode;
  theater: Theater | null;
};

type CinemaState = {
  search: string;
  statusFilter: StatusFilter;
  page: number;
  pageSize: number;
  drawer: TheaterDrawerState;

  setSearch: (q: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  openCreate: () => void;
  openView: (theater: Theater) => void;
  openEdit: (theater: Theater) => void;
  closeDrawer: () => void;
};

const useCinemaStore = create<CinemaState>((set) => ({
  search: "",
  statusFilter: "all",
  page: 0,
  pageSize: 10,
  drawer: { open: false, mode: "create", theater: null },

  setSearch: (search) => set({ search, page: 0 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 0 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 0 }),

  openCreate: () => set({ drawer: { open: true, mode: "create", theater: null } }),
  openView: (theater) => set({ drawer: { open: true, mode: "view", theater } }),
  openEdit: (theater) => set({ drawer: { open: true, mode: "edit", theater } }),

  closeDrawer: () =>
    set((s) => ({ drawer: { ...s.drawer, open: false } })),
}));

export type { TheaterDrawerMode, StatusFilter };
export { useCinemaStore };