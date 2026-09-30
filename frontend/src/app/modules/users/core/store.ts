import {create} from "zustand";
import type {User} from "./model";

type UserDrawerMode = "create" | "view" | "edit";

type StatusFilter = "all" | "active" | "inactive";


type UserDrawerState = {
    open: boolean;
    mode: UserDrawerMode;
    user: User | null;
};


type UsersState = {
    rows: User[];
    search: string;
    page: number;
    pageSize: number;
    drawer: UserDrawerState;
    statusFilter: StatusFilter;   // ← add

    setRows: (rows: User[]) => void;
    setSearch: (q: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setStatusFilter: (status: StatusFilter) => void;  // ← add


    openCreate: () => void;
    openView: (user: User) => void;
    openEdit: (user: User) => void;
    closeDrawer: () => void;
};

const useUsersStore = create<UsersState>((set) => ({
    rows: [],
    search: "",
    statusFilter: "all",   // ← add
    page: 0,
    pageSize: 10,
    drawer: {open: false, mode: "create", user: null},

    setRows: (rows) => set({rows}),
    setSearch: (search) => set({search, page: 0}),
    setStatusFilter: (statusFilter) => set({statusFilter, page: 0}),
    setPage: (page) => set({page}),
    setPageSize: (pageSize) => set({pageSize, page: 0}),

    openCreate: () => set({drawer: {open: true, mode: "create", user: null}}),
    openView: (user) => set({drawer: {open: true, mode: "view", user}}),
    openEdit: (user) => set({drawer: {open: true, mode: "edit", user}}),

    closeDrawer: () =>
        set((s) => ({drawer: {...s.drawer, open: false}})),
}));

export type {UserDrawerMode};
export {useUsersStore};