import api from "../../../../service/api";
import { Showtime, ShowtimePayload } from "./model";

export type ShowtimeParams = {
    search?: string;
    is_active?: boolean;
    movie?: number;
    screen__theater?: number;
    date?: string; // YYYY-MM-DD
};

// Drops empty values so the query string only has real filters.
const clean = (params: ShowtimeParams) =>
    Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v != null)
    );

export const getShowtimes = async (params: ShowtimeParams = {}): Promise<Showtime[]> => {
    const { data } = await api.get("/showtimes", { params: clean(params) });
    return data;
};

export const getShowtime = async (id: number): Promise<Showtime> => {
    const { data } = await api.get(`/showtimes/${id}`);
    return data;
};

// JSON, not FormData — showtimes have no file upload.
export const createShowtime = async (payload: ShowtimePayload): Promise<Showtime> => {
    const { data } = await api.post("/showtimes", payload);
    return data;
};

export const updateShowtime = async (
    id: number,
    payload: Partial<ShowtimePayload>
): Promise<Showtime> => {
    const { data } = await api.patch(`/showtimes/${id}`, payload);
    return data;
};

export const deleteShowtime = async (id: number): Promise<void> => {
    await api.delete(`/showtimes/${id}`);
};