// src/components/MapContainer.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useRunningTracker } from "../hooks/useRunningTracker";
import { formatElapsedTime, formatPace } from "../utils/timeUtils";
import { calculateDistanceFromPath, getDistanceFromLatLonInMeters } from "../utils/geoUtils";
import StartButton from "./buttons/StartButton";
import StopButton from "./buttons/StopButton";
import RunSummary from "./summaries/RunSummary";
import styles from "./MapContainer.module.css";
import html2canvas from "html2canvas";
import { useAuthFetch } from "../utils/useAuthFetch";
import { useUploadFetch } from "../utils/useUploadFetch";
import { useLocationContext } from "../contexts/LocationContext";

interface LatLng {
  lat: number;
  lng: number;
}

interface RunMetaData {
  start: LatLng;
  end: LatLng;
  startedTime: string;
  endedTime: string;
  pathGeoJson: string;
  followedCourseId?: string;
}

export interface RunningState {
  isRunning: boolean;
  startedTime: string;
  path: LatLng[];
  elapsedTime: number;
  endedTime?: string;
}

const MapContainer = () => {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("courseId") ?? undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markerRef = useRef<kakao.maps.Marker | null>(null);
  const friendMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const coursePolylineRef = useRef<kakao.maps.Polyline | null>(null);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const uploadFetch = useUploadFetch();
  const { showFriendsOnMap } = useLocationContext();
  const [mapReady, setMapReady] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [distance, setDistance] = useState(0);
  const [averagePace, setAveragePace] = useState("");
  const [metaData, setMetaData] = useState<RunMetaData | null>(null);
  const [offCourseWarning, setOffCourseWarning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const prevPositionRef = useRef<LatLng | null>(null);

  const handleMapReady = useCallback((): void => {
    setMapReady(true);
  }, []);

  useKakaoMap({
    mapRef,
    markerRef,
    containerRef,
    onMapReady: handleMapReady, // ✅ 고정된 함수 전달
  });

  const { isRunning, path, elapsedTime, startRunning, stopRunning, restoreRunningState } = useRunningTracker({
    mapRef,
    markerRef,
  });

  const updateUserLocation = async (lat: number, lng: number): Promise<void> => {
    try {
      await authFetch("http://localhost:8080/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      console.log("📡 위치 서버 전송 완료");
    } catch (error) {
      console.error("❌ 위치 업데이트 실패:", error);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval: number = window.setInterval(() => {
      if (path.length > 0) {
        const latest = path[path.length - 1];
        updateUserLocation(latest.lat, latest.lng);

        // ✅ 이탈 여부 판단 (유도선에서 30m 이상 떨어진 경우)
        if (coursePolylineRef.current) {
          const distanceToPath = coursePolylineRef.current
            .getPath()
            .reduce((min: number, latlng: kakao.maps.LatLng) => {
              const d = getDistanceFromLatLonInMeters(latlng.getLat(), latlng.getLng(), latest.lat, latest.lng);
              return Math.min(min, d);
            }, Infinity);

          console.log("📏 실시간 유도선 거리:", distanceToPath);

          if (distanceToPath > 30) {
            console.log("⚠️ 실시간 경로 이탈 감지됨");
            setOffCourseWarning(true);
          } else {
            setOffCourseWarning(false);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isRunning, path]);

  const handleStop = (): void => {
    const result = stopRunning();

    // StoppedRunData | null 반환되므로 null 체크
    if (!result || !path || path.length === 0) {
      alert("❌ 위치 데이터가 충분하지 않아 러닝을 저장할 수 없습니다.");
      return;
    }

    const dist: number = calculateDistanceFromPath(path); // number 반환
    const pace: string = formatPace(elapsedTime, dist); // string 반환

    setDistance(dist); // number 상태
    setAveragePace(pace); // string 상태
    setMetaData(result); // RunMetaData 상태 (StoppedRunData와 동일 구조)
    setShowSummary(true); // boolean 상태
  };

  const fitMapToPath = (): void => {
    if (!mapRef.current || path.length < 2) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    path.forEach((point: LatLng) => {
      bounds.extend(new window.kakao.maps.LatLng(point.lat, point.lng));
    });

    mapRef.current.setBounds(bounds);
  };

  const captureMapAsImage = async (): Promise<string | null> => {
    const mapElement: HTMLElement | null = document.getElementById("map");
    if (!mapElement) return null;

    const canvas: HTMLCanvasElement = await html2canvas(mapElement);

    const resizedCanvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D | null = resizedCanvas.getContext("2d");

    if (!ctx) return null;

    resizedCanvas.width = 400;
    resizedCanvas.height = 300;
    ctx.drawImage(canvas, 0, 0, 400, 300);

    return resizedCanvas.toDataURL("image/png", 0.8);
  };

  const handleSave = async (): Promise<void> => {
    if (!metaData) return;

    fitMapToPath();
    await new Promise((r) => setTimeout(r, 1000));

    const imageDataUrl: string | null = await captureMapAsImage();
    if (!imageDataUrl) {
      alert("❌ 이미지 캡처 실패");
      return;
    }

    const imageBlob: Blob = await (await fetch(imageDataUrl)).blob();

    const formData = new FormData();
    formData.append("image", imageBlob, "thumbnail.png");

    const dataPayload: {
      distance: string;
      time: number;
      pace: string;
      pathGeoJson: string;
      startedTime: string;
      endedTime: string;
      startLatitude: number;
      startLongitude: number;
      endLatitude: number;
      endLongitude: number;
      followedCourseId?: string;
    } = {
      distance: distance.toFixed(2),
      time: elapsedTime,
      pace: averagePace,
      pathGeoJson: metaData.pathGeoJson,
      startedTime: metaData.startedTime,
      endedTime: metaData.endedTime,
      startLatitude: metaData.start.lat,
      startLongitude: metaData.start.lng,
      endLatitude: metaData.end.lat,
      endLongitude: metaData.end.lng,
    };

    if (courseId) {
      dataPayload.followedCourseId = courseId;
    }

    formData.append("data", new Blob([JSON.stringify(dataPayload)], { type: "application/json" }));

    try {
      const response = await uploadFetch("http://localhost:8080/running-record", formData);
      if (!response.ok) throw new Error("서버 응답 실패");

      alert("✅ 러닝 기록이 저장되었습니다!");
      setShowSummary(false);
      navigate("/my-records");
    } catch (error: any) {
      console.error("❌ 저장 실패:", error.message);
      alert("⚠️ 저장 실패! 복구 기능이 활성화됩니다.");
      localStorage.setItem(
        "unsavedRun",
        JSON.stringify({
          ...metaData,
          distance: distance.toFixed(2),
          time: elapsedTime,
          pace: averagePace,
          imageDataUrl,
        })
      );
    }
  };

  const handleCancel = (): void => {
    alert("❌ 기록이 저장되지 않았습니다. 해당 러닝은 경험치에 반영되지 않습니다.");
    setShowSummary(false);
  };

  useEffect(() => {
    const drawCoursePolyline = async (): Promise<void> => {
      if (!courseId || !mapRef.current) {
        console.warn("❌ courseId 또는 mapRef.current 없음");
        return;
      }

      try {
        const res = await authFetch(`http://localhost:8080/course/${courseId}`);
        if (!res.ok) throw new Error("추천 코스 로딩 실패");

        const data = await res.json();

        // 타입 정의 (선택적으로 빼기 가능)
        interface CourseData {
          pathGeoJson?: any;
          coordinates?: [number, number][];
          path?: [number, number][];
        }

        const courseData: CourseData = data;

        if (typeof courseData.pathGeoJson === "string") {
          try {
            courseData.pathGeoJson = JSON.parse(courseData.pathGeoJson);
            console.log("🧩 pathGeoJson 파싱 완료:", courseData.pathGeoJson);
          } catch (e) {
            console.error("❌ pathGeoJson JSON 파싱 실패:", e);
          }
        }

        const coords: [number, number][] =
          courseData.coordinates || courseData.path || courseData.pathGeoJson?.coordinates || [];

        if (!coords.length) {
          console.warn("❌ 유도선 좌표가 비어있음:", courseData);
          return;
        }

        console.log("📍 course coordinates", coords);

        const kakaoCoords: kakao.maps.LatLng[] = coords.map(
          ([lng, lat]: [number, number]) => new window.kakao.maps.LatLng(lat, lng)
        );

        const polyline = new window.kakao.maps.Polyline({
          path: kakaoCoords,
          strokeWeight: 5,
          strokeColor: "#FF6F61",
          strokeOpacity: 0.7,
          strokeStyle: "solid",
        });

        polyline.setMap(mapRef.current);
        coursePolylineRef.current = polyline;
      } catch (err) {
        console.error("❌ 유도선 로딩 실패:", err);
      }
    };

    if (mapReady && courseId) {
      drawCoursePolyline();
    }
  }, [mapReady, courseId]);

  useEffect(() => {
    console.log("🧪 mapReady 상태 변화 감지:", mapReady);
  }, [mapReady]);

  useEffect(() => {
    const fetchNearbyFriends = async (): Promise<void> => {
      if (!showFriendsOnMap || !mapRef.current) return;

      try {
        const res: Response = await authFetch("http://localhost:8080/location/nearby?radius=0.5");
        if (!res.ok) throw new Error("친구 목록 가져오기 실패");

        const data: {
          latitude: number;
          longitude: number;
          nickname: string;
          profileImage?: string;
        }[] = await res.json();

        // 기존 마커 제거
        friendMarkersRef.current.forEach((marker: kakao.maps.Marker) => marker.setMap(null));
        friendMarkersRef.current = [];

        if (!Array.isArray(data) || data.length === 0) return;

        const center = mapRef.current.getCenter();
        const centerLat = center.getLat();
        const centerLng = center.getLng();

        data.forEach(({ latitude, longitude, nickname, profileImage }) => {
          const distance = getDistanceFromLatLonInMeters(centerLat, centerLng, latitude, longitude);
          if (distance <= 500) {
            const markerImage = new window.kakao.maps.MarkerImage(
              profileImage || "/default-profile.png",
              new window.kakao.maps.Size(40, 40),
              { offset: new window.kakao.maps.Point(20, 20) }
            );

            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(latitude, longitude),
              map: mapRef.current!,
              title: nickname,
              image: markerImage,
            });

            friendMarkersRef.current.push(marker);
          }
        });
      } catch (err) {
        console.error("📛 친구 마커 로딩 실패:", err);
      }
    };

    const interval: number = window.setInterval(fetchNearbyFriends, 10000);
    fetchNearbyFriends();

    return () => clearInterval(interval);
  }, [showFriendsOnMap]);

  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const prev = prevPositionRef.current;
          const movedEnough = !prev || getDistanceFromLatLonInMeters(prev.lat, prev.lng, latitude, longitude) > 50;

          if (!movedEnough || isFetching) return;

          setIsFetching(true);
          try {
            await authFetch(`http://localhost:8080/location/nearby?radius=0.5`);
            prevPositionRef.current = { lat: latitude, lng: longitude };
          } catch (err) {
            console.error("❌ 친구 위치 조회 실패:", err);
          } finally {
            setIsFetching(false);
          }
        },
        (err) => console.error("위치 조회 실패", err),
        { enableHighAccuracy: true }
      );
    }, 30000); // 30초마다 실행

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("runningState");
    if (saved) {
      try {
        const parsed: Partial<RunningState> = JSON.parse(saved);
        if (parsed?.isRunning === true && !parsed?.endedTime) {
          restoreRunningState(parsed);
        }
      } catch (err) {
        console.error("❌ runningState 복원 중 JSON 파싱 실패:", err);
      }
    }
  }, []);

  return (
    <>
      <div className={styles.mapWrapper}>
        <div ref={containerRef} id='map' className={styles.map}></div>
        {isRunning && <div className={styles.timer}>⏱️ {formatElapsedTime(elapsedTime)}</div>}
        {offCourseWarning && <div className={styles.warning}>⚠️ 경로를 벗어났습니다! 유도선을 따라가세요.</div>}
      </div>

      {!isRunning && !showSummary && <StartButton onClick={startRunning} />}
      {isRunning && <StopButton onClick={handleStop} />}
      {showSummary && (
        <RunSummary
          elapsedTime={elapsedTime}
          distance={distance}
          pace={averagePace}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default MapContainer;
