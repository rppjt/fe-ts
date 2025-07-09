// src/contexts/AuthContextUtils.ts
export const setAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
