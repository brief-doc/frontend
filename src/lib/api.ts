import axios from "axios";

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) ?? "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,   // 모든 요청에 쿠키 자동 전송 (credentials: "include" 상당)
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  export default api;