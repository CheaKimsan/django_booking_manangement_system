import api from "../../../../service/api";
import { Movie } from "./model";

export const getMovies = async (search = ""): Promise<Movie[]> => {
    const { data } = await api.get("/movies", { params: search ? { search } : {} });
    return data;
};

export const getMovie = async (id: number): Promise<Movie> => {
    const { data } = await api.get(`/movies/${id}`);
    return data;
};

// FormData, not JSON — a poster file can ride along in the same request.
export const createMovie = async (formData: FormData): Promise<Movie> => {
    const { data } = await api.post("/movies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const updateMovie = async (id: number, formData: FormData): Promise<Movie> => {
    const { data } = await api.patch(`/movies/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const deleteMovie = async (id: number): Promise<void> => {
    await api.delete(`/movies/${id}`);
};