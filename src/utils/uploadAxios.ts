// src/utils/uploadAxios.ts
import axios from "axios";

const uploadAxios = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

uploadAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // 또는 쿠키 등 다른 저장소에서 불러올 수 있음
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default uploadAxios;
