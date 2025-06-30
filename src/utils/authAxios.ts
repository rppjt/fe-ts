import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken } from "../contexts/AuthContextUtils";
import type { AxiosRequestConfig } from "axios";

// CRA에서는 이렇게 써야 함
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const authAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔧 request 인터셉터에 정확한 타입 사용
authAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authAxios.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && (error.response.data as any)?.code === "J001" && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return authAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error("🔁 refresh 실패 → 강제 로그아웃");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
