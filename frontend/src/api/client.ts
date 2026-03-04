import axios from "axios";
import { clearAuthSession, getAccessToken } from "../auth/authStorage";

const client = axios.create({
  baseURL: "/api",
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAuthSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        alert("로그인이 필요한 서비스입니다.");
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default client;
