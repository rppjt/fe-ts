import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import authAxios from "../utils/authAxios";

interface LocationContextType {
  isSharing: boolean;
  toggleSharing: () => void;
  showFriendsOnMap: boolean;
  toggleShowFriends: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const { accessToken, isAuthReady } = useAuth();

  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [showFriendsOnMap, setShowFriendsOnMap] = useState<boolean>(() => {
    const stored = localStorage.getItem("showFriendsOnMap");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    if (!isAuthReady || !accessToken) return;

    const fetchSharingStatus = async () => {
      try {
        const res = await authAxios.get("/location/sharing");
        setIsSharing(res.data.isSharing);
      } catch (err) {
        console.error("📛 위치 공유 상태 불러오기 실패", err);
      }
    };

    fetchSharingStatus();
  }, [accessToken, isAuthReady]);

  const toggleSharing = async () => {
    const next = !isSharing;
    try {
      const res = await authAxios.patch("/location/sharing", { isSharing: next });
      setIsSharing(res.data.isSharing);
      if (res.data.message) {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("📛 위치 공유 전송 실패:", err);
      alert("❌ 위치 공유 상태 변경에 실패했습니다.");
    }
  };

  const toggleShowFriends = () => {
    const next = !showFriendsOnMap;
    setShowFriendsOnMap(next);
    localStorage.setItem("showFriendsOnMap", next.toString());
  };

  return (
    <LocationContext.Provider
      value={{
        isSharing,
        toggleSharing,
        showFriendsOnMap,
        toggleShowFriends,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext는 LocationProvider 내부에서만 사용해야 합니다.");
  }
  return context;
};
