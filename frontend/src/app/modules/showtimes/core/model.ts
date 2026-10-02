export type ShowtimeMovie = {
  id: number;
  title: string;
  genre: string;
  language: string;
  duration_min: number;
  poster: string | null;
};

export type ShowtimeScreen = {
  id: number;
  name: string;
  theater: number;
  theater_name: string;
};

// Matches ShowtimeSerializer output
export type Showtime = {
  id: number;
  movie: number;
  screen: number;
  start_time: string; // ISO
  end_time: string;   // ISO
  price: string;      // DRF returns decimals as strings
  is_active: boolean;
  movie_detail: ShowtimeMovie;
  screen_detail: ShowtimeScreen;
};

// Body for create / update
export type ShowtimePayload = {
  movie: number;
  screen: number;
  start_time: string;
  price: string | number;
  is_active: boolean;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// DRF validation errors, e.g. { non_field_errors: ["...overlaps..."] }
export type ApiError = Error & { status?: number; data?: Record<string, string[]> };