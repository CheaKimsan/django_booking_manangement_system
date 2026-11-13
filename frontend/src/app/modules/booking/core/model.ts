// ─── Seat Types ────────────────────────────────────────────────────
export type SeatType = "REGULAR" | "VIP" | "COUPLE";

export type Seat = {
    id: number;
    row: string;
    number: number;
    seat_type: SeatType;
};

// ─── Booking Status ────────────────────────────────────────────────
export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "EXPIRED"
    | "COMPLETED";

// ─── Nested: Movie ─────────────────────────────────────────────────
export type BookingMovie = {
    id: number;
    title: string;
    genre: string;
    language: string;
    duration_min: number;
    poster: string | null;
};

// ─── Nested: Screen ────────────────────────────────────────────────
export type BookingScreen = {
    id: number;
    name: string;
    theater: number;
    theater_name: string;
};

// ─── Nested: Showtime ──────────────────────────────────────────────
export type BookingShowtime = {
    id: number;
    start_time: string;    // ISO 8601
    price: string;         // DRF decimal — always a string
    movie_detail: BookingMovie;
    screen_detail: BookingScreen;
};

// ─── Nested: Booking Seat ──────────────────────────────────────────
export type BookingSeat = {
    id: number;            // BookingSeat row id
    seat: number;          // Seat FK id
    seat_detail: Seat;     // expanded seat info
};

// ─── Booking ───────────────────────────────────────────────────────
export type Booking = {
    id: number;
    booking_code: string | null;      // null until confirmed
    user: number;                     // user id
    username: string;
    showtime: number;                 // showtime id
    showtime_detail: BookingShowtime;
    status: BookingStatus;
    total_price: string;              // DRF decimal as string
    expires_at: string | null;        // null when not PENDING
    confirmed_at: string | null;      // null if never confirmed
    created_at: string;               // ISO 8601
    seats: BookingSeat[];
};

// ─── Create / Update Payload ───────────────────────────────────────
export type CreateBookingPayload = {
    showtime: number;
    seat_ids: number[];               // write-only field for creating
};

// ─── Pagination (if your API uses DRF pagination) ─────────────────
export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

// ─── API Error ─────────────────────────────────────────────────────
export type ApiError = Error & {
    status?: number;
    data?: Record<string, string[]>;
};