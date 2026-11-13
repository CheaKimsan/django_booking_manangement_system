import type {
    Booking,
    CreateBookingPayload,
    Paginated,
} from "./model";
import api from "../../../../service/api";


/**
 * Get all bookings.
 * Admins get every booking, customers get only their own
 * (the backend filters based on the authenticated user).
 */
export async function getBookings(params?: {
    status?: string;
    showtime?: number;
    search?: string;
}): Promise<Booking[]> {
    const { data } = await api.get<Booking[] | Paginated<Booking>>(
        "/bookings",
        { params }
    );
    return Array.isArray(data) ? data : data.results ?? [];
}

/**
 * Get a single booking by id.
 */
export async function getBooking(id: number): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
}

/**
 * Look up a booking by its code (for door scanning / customer service).
 * Example code: "BK-8BKLA99F"
 */
export async function getBookingByCode(code: string): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/by-code/${code}`);
    return data;
}

/**
 * Get the current user's bookings only.
 * If the backend has a dedicated /bookings/me/ endpoint, switch to it.
 */
export async function getMyBookings(params?: {
    status?: string;
}): Promise<Booking[]> {
    return getBookings(params);
}

// ─────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────

/**
 * Create a new booking in PENDING state.
 * The backend locks the seats for ~10 minutes until confirmed or expired.
 */
export async function createBooking(
    payload: CreateBookingPayload
): Promise<Booking> {
    const { data } = await api.post<Booking>("/bookings", payload);
    return data;
}

// ─────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Confirm a PENDING booking.
 * This generates the `booking_code` and sets the status to CONFIRMED.
 * The backend rejects with 400 if the booking has expired.
 */
export async function confirmBooking(id: number): Promise<Booking> {
    const { data } = await api.post<Booking>(`/bookings/${id}/confirm`);
    return data;
}

/**
 * Cancel a booking.
 * The backend rejects with 400 if the showtime has already started.
 */
export async function cancelBooking(id: number): Promise<Booking> {
    const { data } = await api.post<Booking>(`/bookings/${id}/cancel`);
    return data;
}

// ─────────────────────────────────────────────────────────────────
// DERIVED HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the IDs of seats already taken (PENDING or CONFIRMED) for a showtime.
 * Used by the seat-selection page to disable booked seats.
 *
 * Note: this does an extra round-trip through /bookings/. If your backend
 * exposes a dedicated /showtimes/{id}/booked-seats/ endpoint, prefer that.
 */
export async function getBookedSeatIds(showtimeId: number): Promise<number[]> {
    const bookings = await getBookings({ showtime: showtimeId });
    const ids = new Set<number>();
    bookings
        .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
        .forEach((b) => b.seats.forEach((s) => ids.add(s.seat)));
    return Array.from(ids);   // ← use Array.from instead of [...ids]
}

/**
 * Fetch all seats of a screen.
 * If your backend exposes seats under screens, adjust the URL.
 */
export async function getScreenSeats(screenId: number) {
    const { data } = await api.get(`/screens/${screenId}/seats`);
    return Array.isArray(data) ? data : data.results ?? [];
}

export async function deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
}

/**
 * POST /api/bookings/{id}/pay/
 * Creates (or returns existing) payment session.
 */
export async function startPayment(bookingId: number): Promise<{
    payment_id: number;
    amount: string;
    checkout_url: string;
    qr_data: string;
    expires_at: string;
}> {
    const { data } = await api.post(`/bookings/${bookingId}/pay`);
    return data;
}

export async function getPaymentStatus(bookingId: number): Promise<{
    status: string;
    booking_code: string | null;
    payment_status: string | null;
    expires_at: string | null;
}> {
    const { data } = await api.get(`/bookings/${bookingId}/payment-status`);
    return data;
}