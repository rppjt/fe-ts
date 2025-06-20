import { useAuth } from "../contexts/AuthContext";

export const useUploadFetch = () => {
  const { accessToken } = useAuth();

  const uploadFetch = async (url: string, formData: FormData): Promise<Response> => {
    return await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      credentials: "include",
    });
  };

  return uploadFetch;
};
