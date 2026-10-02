import { Theater, TheaterPayload, Screen, ScreenPayload } from "./model";
import api from "../../../../service/api";

// ── Theater (Cinema) ──────────────────────────────────────────

export const getTheaters = async (search = ""): Promise<Theater[]> => {
  const { data } = await api.get("/theaters", { params: search ? { search } : {} });
  return data;
};

export const getTheater = async (id: number): Promise<Theater> => {
  const { data } = await api.get(`/theaters/${id}`);
  return data;
};

export const createTheater = async (payload: TheaterPayload): Promise<Theater> => {
  const { data } = await api.post("/theaters", payload);
  return data;
};

export const updateTheater = async (id: number, payload: Partial<TheaterPayload>): Promise<Theater> => {
  const { data } = await api.patch(`/theaters/${id}`, payload);
  return data;
};

export const deleteTheater = async (id: number): Promise<void> => {
  await api.delete(`/theaters/${id}`);
};

// ── Screen ─────────────────────────────────────────────────────
// Seats are never created/edited directly — they auto-generate on the
// backend whenever a screen is created (see Screen.save() / _generate_seats).

export const getScreens = async (theaterId?: number): Promise<Screen[]> => {
  const { data } = await api.get("/screens", {
    params: theaterId ? { theater: theaterId } : {},
  });
  return data;
};

export const getScreen = async (id: number): Promise<Screen> => {
  const { data } = await api.get(`/screens/${id}`);
  return data;
};

export const createScreen = async (payload: ScreenPayload): Promise<Screen> => {
  const { data } = await api.post("/screens", payload);
  return data;
};

export const updateScreen = async (id: number, payload: Partial<ScreenPayload>): Promise<Screen> => {
  const { data } = await api.patch(`/screens/${id}`, payload);
  return data;
};

export const deleteScreen = async (id: number): Promise<void> => {
  await api.delete(`/screens/${id}`);
};