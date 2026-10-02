import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createShowtime,
    deleteShowtime,
    getShowtime,
    getShowtimes,
    updateShowtime,
    ShowtimeParams,
} from "./request";
import { ShowtimePayload } from "./model";
import { useShowtimeStore } from "./store";

const KEY = ["showtimes"] as const;


export function useShowtimes() {
    const { search, statusFilter, movieFilter, theaterFilter, dateFilter } =
        useShowtimeStore();

    const params: ShowtimeParams = {
        search,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active",
        movie: movieFilter ?? undefined,
        screen__theater: theaterFilter ?? undefined,
        date: dateFilter ?? undefined,
    };

    return useQuery({
        queryKey: [...KEY, params],
        queryFn: () => getShowtimes(params),
    });
}

export function useShowtime(id: number | null | undefined) {
    return useQuery({
        queryKey: [...KEY, "detail", id],
        queryFn: () => getShowtime(id as number),
        enabled: !!id,
    });
}

export function useCreateShowtime() {
    const qc = useQueryClient();
    const closeDrawer = useShowtimeStore((s) => s.closeDrawer);

    return useMutation({
        mutationFn: (payload: ShowtimePayload) => createShowtime(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
            closeDrawer();
        },
    });
}

export function useUpdateShowtime() {
    const qc = useQueryClient();
    const closeDrawer = useShowtimeStore((s) => s.closeDrawer);

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<ShowtimePayload> }) =>
            updateShowtime(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
            closeDrawer();
        },
    });
}

export function useDeleteShowtime() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteShowtime(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}