import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";
import authAxios from "../../utils/authAxios";

// ✅ GeoJSON 타입 정의
interface GeoJsonLine {
  type: string;
  coordinates: [number, number][];
}

// ✅ 러닝 기록 타입
interface RunningRecord {
  id: number;
  totalDistance: number;
  totalTime: number;
  pace: string;
  pathGeoJson: GeoJsonLine;
  startedTime: string;
  endedTime: string;
  thumbnailUrl?: string;
  isRegisteredAsCourse?: boolean;
}

const DetailMyRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [record, setRecord] = useState<RunningRecord | null>(null);
  const [isRecommended, setIsRecommended] = useState<boolean>(false);
  const navigate = useNavigate();

  // 기록 조회
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await authAxios.get<RunningRecord>(`/running-record/${id}`);

        setRecord(res.data);
        setIsRecommended(res.data.isRegisteredAsCourse ?? false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecord();
  }, [id]);

  // 카카오 지도 렌더링
  useEffect(() => {
    if (!record || !window.kakao?.maps) return;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    };
    mapRef.current = new window.kakao.maps.Map(container, options);

    const linePath = record.pathGeoJson.coordinates.map(([lng, lat]) => new window.kakao.maps.LatLng(lat, lng));

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polylineRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(linePath[0]);
  }, [record]);

  if (!record) return <div className={styles.container}>로딩 중...</div>;

  const handleRecommend = async () => {
    if (!window.confirm("이 기록을 추천코스로 등록하시겠습니까?")) return;

    try {
      await authAxios.post("/course", { recordId: parseInt(id!) });
      alert("🚀 추천코스로 등록되었습니다!");
      navigate("/courses");
      setIsRecommended(true);
    } catch (err) {
      console.error("❌ 추천 등록 실패:", err);
      alert("⚠️ 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("삭제 후 복구 페이지로 이동합니다. 계속할까요?")) return;

    try {
      localStorage.setItem(
        "unsavedRun",
        JSON.stringify({
          distance: record.totalDistance,
          time: record.totalTime,
          pace: record.pace,
        })
      );

      await authAxios.delete(`/running-record/${record!.id}`);
      alert("✅ 삭제 완료! 복구 페이지로 이동합니다.");
      navigate("/recover");
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("⚠️ 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>📍 상세 러닝 기록</h2>
      {record.thumbnailUrl && (
        <img
          src={record.thumbnailUrl}
          alt='러닝 썸네일'
          className={styles.thumbnail}
          style={{
            width: "100%",
            maxHeight: "300px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "1rem",
          }}
        />
      )}
      <div id='map' className={styles.map}></div>
      <div className={styles.recordDetail}>
        <p>
          <strong>시작 시간:</strong> {new Date(record.startedTime).toLocaleString()}
        </p>
        <p>
          <strong>종료 시간:</strong> {new Date(record.endedTime).toLocaleString()}
        </p>
        <p>
          <strong>총 거리:</strong> {record.totalDistance} km
        </p>
        <p>
          <strong>소요 시간:</strong> {Math.floor(record.totalTime / 60)}분 {record.totalTime % 60}초
        </p>
        <p>
          <strong>페이스:</strong> {record.pace} 분/km
        </p>
      </div>

      {!isRecommended && (
        <button onClick={handleRecommend} className={styles.recommendButton}>
          🚀 추천코스 등록
        </button>
      )}
      <button onClick={handleDelete} className={styles.deleteButton}>
        🗑️ 기록 삭제
      </button>
    </div>
  );
};

export default DetailMyRecord;
