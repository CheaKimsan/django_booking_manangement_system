export interface Movie {
    id: number;
    title: string;
    description: string;
    genre: string;
    language: string;
    duration_min: number;
    release_date: string | null;   // ISO date string, e.g. "2026-05-01"
    poster: string | null;         // absolute URL (DRF builds it from MEDIA_URL + request)
    is_active: boolean;
    created_at: string;            // ISO datetime string
}

export interface MoviePayload {
    title: string;
    description?: string;
    genre: string;
    language: string;
    duration_min: number;
    release_date?: string | null;
    is_active?: boolean;
}

export const MOVIE_GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Animation",
    "Documentary",
] as const;

export const MOVIE_LANGUAGES = [
    "English",
    "Khmer",
    "Korean",
    "Chinese",
    "Japanese"
] as const;