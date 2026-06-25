import axios from "axios";

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) ?? "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;