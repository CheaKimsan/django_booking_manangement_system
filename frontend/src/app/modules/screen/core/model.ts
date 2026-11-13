// ─── Seat Types ────────────────────────────────────────────────────
export type SeatType = "REGULAR" | "VIP" | "COUPLE";

// ─── Seat (matches backend SeatSerializer) ─────────────────────────
export type Seat = {
    id: number;
    row: string;         // e.g. "A", "B", "C"
    number: number;      // e.g. 1, 2, 3
    seat_type: SeatType;
};

// ─── Screen (matches backend ScreenSerializer) ─────────────────────
export type Screen = {
    id: number;
    name: string;
    theater: number;              // theater FK id
    theater_name?: string;        // optional: if backend provides it
    total_rows: number;           // number of rows
    seats_per_row: number;        // seats per row
    seats: Seat[];                // all seats in this screen
    is_active?: boolean;          // optional
};

// ─── Screen create/update payload ──────────────────────────────────
export type ScreenPayload = {
    theater: number;
    name: string;
    total_rows: number;
    seats_per_row: number;
    is_active?: boolean;
};

// ─── Partial update (for toggling fields) ──────────────────────────
export type ScreenUpdatePayload = Partial<ScreenPayload>;

// ─── Paginated response (if backend uses DRF pagination) ───────────
export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

// ─── API error shape ───────────────────────────────────────────────
export type ApiError = Error & {
    status?: number;
    data?: Record<string, string[]>;
};

// ─── Helper: format seat label (A1, B12, etc.) ─────────────────────
export const seatLabel = (seat: Seat): string =>
    `${seat.row}${seat.number}`;

// ─── Helper: total seat count ──────────────────────────────────────
export const totalSeats = (screen: Screen): number =>
    screen.seats?.length ?? screen.total_rows * screen.seats_per_row;