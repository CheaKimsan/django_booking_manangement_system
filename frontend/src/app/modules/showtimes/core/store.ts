import { create } from "zustand";
import type { Showtime } from "./model";

type ShowtimeDrawerMode = "create" | "view" | "edit";
type StatusFilter = "all" | "active" | "inactive";

type ShowtimeDrawerState = {
  open: boolean;
  mode: ShowtimeDrawerMode;
  showtime: Showtime | null;
};

type ShowtimeState = {
  search: string;
  statusFilter: StatusFilter;
  movieFilter: number | null;
  theaterFilter: number | null;
  dateFilter: string | null; // YYYY-MM-DD
  page: number;              // 0-based (MUI); converted to 1-based in the API layer
  pageSize: number;
  drawer: ShowtimeDrawerState;

  setSearch: (q: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setMovieFilter: (movieId: number | null) => void;
  setTheaterFilter: (theaterId: number | null) => void;
  setDateFilter: (date: string | null) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  openCreate: () => void;
  openView: (showtime: Showtime) => void;
  openEdit: (showtime: Showtime) => void;
  closeDrawer: () => void;
};

const useShowtimeStore = create<ShowtimeState>((set) => ({
  search: "",
  statusFilter: "all",
  movieFilter: null,
  theaterFilter: null,
  dateFilter: null,
  page: 0,
  pageSize: 10,
  drawer: { open: false, mode: "create", showtime: null },

  setSearch: (search) => set({ search, page: 0 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 0 }),
  setMovieFilter: (movieFilter) => set({ movieFilter, page: 0 }),
  setTheaterFilter: (theaterFilter) => set({ theaterFilter, page: 0 }),
  setDateFilter: (dateFilter) => set({ dateFilter, page: 0 }),
  resetFilters: () =>
    set({
      search: "",
      statusFilter: "all",
      movieFilter: null,
      theaterFilter: null,
      dateFilter: null,
      page: 0,
    }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 0 }),

  openCreate: () => set({ drawer: { open: true, mode: "create", showtime: null } }),
  openView: (showtime) => set({ drawer: { open: true, mode: "view", showtime } }),
  openEdit: (showtime) => set({ drawer: { open: true, mode: "edit", showtime } }),

  closeDrawer: () => set((s) => ({ drawer: { ...s.drawer, open: false } })),
}));

export type { ShowtimeDrawerMode, StatusFilter };

export { useShowtimeStore };