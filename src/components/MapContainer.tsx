// ✅ TypeScript로 변환된 MapContainer.tsx (JSX 구조 유지)

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

  const handleMapReady = useCallback(() => setMapReady(true), []);
  useKakaoMap({ mapRef, markerRef, containerRef, onMapReady: handleMapReady });

  const { isRunning, path, startRunning, stopRunning, elapsedTime, restoreRunningState } = useRunningTracker(
    mapRef,
    markerRef
  );

  useEffect(() => {
    const drawCoursePolyline = async () => {
      if (!mapReady || !courseId || !mapRef.current) return;
      try {
        const res = await authFetch(`http://localhost:8080/course/${courseId}`);
        if (!res.ok) throw new Error("추천 코스 로딩 실패");
        const data = await res.json();

        if (typeof data.pathGeoJson === "string") {
          try {
            data.pathGeoJson = JSON.parse(data.pathGeoJson);
          } catch (e) {
            console.error("pathGeoJson 파싱 실패", e);
          }
        }

        const coords = data.coordinates || data.path || data.pathGeoJson?.coordinates || [];
        if (!coords.length) return;

        const kakaoCoords = coords.map(([lng, lat]: [number, number]) => new window.kakao.maps.LatLng(lat, lng));

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
        console.error("유도선 로딩 실패", err);
      }
    };
    drawCoursePolyline();
  }, [mapReady, courseId]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const latest = path[path.length - 1];
      if (!latest) return;
      authFetch("http://localhost:8080/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: latest.lat, longitude: latest.lng }),
      });

      if (coursePolylineRef.current) {
        const distanceToPath = coursePolylineRef.current.getPath().reduce((min, latlng) => {
          const d = getDistanceFromLatLonInMeters(latlng.getLat(), latlng.getLng(), latest.lat, latest.lng);
          return Math.min(min, d);
        }, Infinity);
        setOffCourseWarning(distanceToPath > 30);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isRunning, path]);

  const handleStop = () => {
    const result = stopRunning();
    if (!result || path.length === 0) {
      alert("❌ 위치 데이터가 부족합니다.");
      return;
    }
    setDistance(calculateDistanceFromPath(path));
    setAveragePace(formatPace(elapsedTime, distance));
    setMetaData(result);
    setShowSummary(true);
  };

  const captureMapAsImage = async (): Promise<string | null> => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return null;
    const canvas = await html2canvas(mapElement);
    return canvas.toDataURL("image/png", 0.8);
  };

  const handleSave = async () => {
    if (!metaData) return;
    const imageDataUrl = await captureMapAsImage();
    const imageBlob = await (await fetch(imageDataUrl!)).blob();

    const formData = new FormData();
    formData.append("image", imageBlob, "thumbnail.png");
    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            ...metaData,
            distance: distance.toFixed(2),
            time: elapsedTime,
            pace: averagePace,
            followedCourseId: courseId,
          }),
        ],
        { type: "application/json" }
      )
    );

    try {
      const res = await uploadFetch("http://localhost:8080/running-record", formData);
      if (!res.ok) throw new Error();
      alert("✅ 저장 완료!");
      setShowSummary(false);
      navigate("/myrecords");
    } catch (err) {
      alert("❌ 저장 실패. 복구 데이터를 생성합니다.");
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

  useEffect(() => {
    const saved = localStorage.getItem("runningState");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.isRunning && !parsed?.endedTime) {
        restoreRunningState(parsed);
      }
    }
  }, []);

  return (
    <>
      <div className={styles.mapWrapper}>
        <div ref={containerRef} id='map' className={styles.map}></div>
        {isRunning && <div className={styles.timer}>⏱️ {formatElapsedTime(elapsedTime)}</div>}
        {offCourseWarning && <div className={styles.warning}>⚠️ 경로를 벗어났습니다!</div>}
      </div>
      {!isRunning && !showSummary && <StartButton onClick={startRunning} />}
      {isRunning && <StopButton onClick={handleStop} />}
      {showSummary && (
        <RunSummary
          elapsedTime={elapsedTime}
          distance={distance}
          pace={averagePace}
          onSave={handleSave}
          onCancel={() => setShowSummary(false)}
        />
      )}
    </>
  );
};

export default MapContainer;
