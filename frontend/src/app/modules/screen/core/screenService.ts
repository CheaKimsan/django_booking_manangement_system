import type {
    Screen,
    ScreenPayload,
    ScreenUpdatePayload,
    Seat,
} from "./model";
import api from "../../../../service/api";

export async function getScreens(theaterId?: number): Promise<Screen[]> {
    const { data } = await api.get<Screen[]>("/screens", {
        params: theaterId ? { theater: theaterId } : undefined,
    });
    return Array.isArray(data) ? data : (data as any).results ?? [];
}

/**
 * GET /api/screens/{id}/
 */
export async function getScreen(id: number): Promise<Screen> {
    const { data } = await api.get<Screen>(`/screens/${id}`);
    return data;
}

/**
 * ✅ FIXED — uses the correct endpoint
 *    GET /api/seats/?screen=<screenId>
 */
export async function getScreenSeats(screenId: number): Promise<Seat[]> {
    const { data } = await api.get<Seat[]>(`/seats`, {
        params: { screen: screenId },
    });
    return Array.isArray(data) ? data : (data as any).results ?? [];
}

// ─────────────────────────────────────────────────────────────────
// CREATE / UPDATE / DELETE
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/screens/
 * Body: { theater, name, total_rows, seats_per_row }
 */
export async function createScreen(payload: ScreenPayload): Promise<Screen> {
    const { data } = await api.post<Screen>("/screens", payload);
    return data;
}

/**
 * PATCH /api/screens/{id}/
 */
export async function updateScreen(
    id: number,
    payload: ScreenUpdatePayload
): Promise<Screen> {
    const { data } = await api.patch<Screen>(`/screens/${id}`, payload);
    return data;
}

/**
 * DELETE /api/screens/{id}/
 */
export async function deleteScreen(id: number): Promise<void> {
    await api.delete(`/screens/${id}`);
}

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE
// ─────────────────────────────────────────────────────────────────

export async function toggleScreenActive(
    id: number,
    active: boolean
): Promise<Screen> {
    return updateScreen(id, { is_active: active });
}