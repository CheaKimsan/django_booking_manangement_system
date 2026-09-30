import {User} from "./model";
import api from "../../../../service/api";

export const getUsers = async (search = ""): Promise<User[]> => {
  const { data } = await api.get("/auth/users", { params: search ? { search } : {} });
  return data;
};

export const getUser = async (id: number): Promise<User> => {
  const { data } = await api.get(`/auth/users/${id}`);
  return data;
};

export const createUser = async (payload: Partial<User> & { password: string }): Promise<User> => {
  const { data } = await api.post("/auth/users", payload);
  return data;
};

export const updateUser = async (id: number, payload: Partial<User>): Promise<User> => {
  const { data } = await api.patch(`/auth/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/auth/users/${id}`);
};