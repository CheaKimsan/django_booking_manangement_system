import { create } from "zustand";
import type { Movie } from "./model";

type MovieDrawerMode = "create" | "view" | "edit";
type StatusFilter = "all" | "active" | "inactive";

type MovieDrawerState = {
  open: boolean;
  mode: MovieDrawerMode;
  movie: Movie | null;
};

type MoviesState = {
  search: string;
  statusFilter: StatusFilter;
  page: number;
  pageSize: number;
  drawer: MovieDrawerState;

  setSearch: (q: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  openCreate: () => void;
  openView: (movie: Movie) => void;
  openEdit: (movie: Movie) => void;
  closeDrawer: () => void;
};

const useMoviesStore = create<MoviesState>((set) => ({
  search: "",
  statusFilter: "all",
  page: 0,
  pageSize: 10,
  drawer: { open: false, mode: "create", movie: null },

  setSearch: (search) => set({ search, page: 0 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 0 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 0 }),

  openCreate: () => set({ drawer: { open: true, mode: "create", movie: null } }),
  openView: (movie) => set({ drawer: { open: true, mode: "view", movie } }),
  openEdit: (movie) => set({ drawer: { open: true, mode: "edit", movie } }),

  closeDrawer: () =>
    set((s) => ({ drawer: { ...s.drawer, open: false } })),
}));

export type { MovieDrawerMode, StatusFilter };
export { useMoviesStore };