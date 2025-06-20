import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RecoverPage.module.css";
import { useAuthFetch } from "../../utils/useAuthFetch";

// ✅ 복구 데이터 타입 정의
interface RecoveryData {
  distance: number;
  time: number;
  pace: string;
  pathGeoJson: {
    type: string;
    coordinates: [number, number][];
  };
  startedTime: string;
  endedTime: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  imageDataUrl?: string;
}

const RecoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const alreadyRedirectedRef = useRef<boolean>(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    const data = localStorage.getItem("unsavedRun");
    if (data) {
      const parsedData: RecoveryData = JSON.parse(data);
      console.log("✅ 복구 데이터 확인:", parsedData);
      setRecoveryData(parsedData);
    } else if (!alreadyRedirectedRef.current) {
      alreadyRedirectedRef.current = true;
      alert("복구할 기록이 없습니다.");
      navigate("/home");
    }
  }, [navigate]);

  const handleRestore = async () => {
    try {
      if (!recoveryData?.imageDataUrl || !recoveryData.imageDataUrl.startsWith("data:image")) {
        alert("⚠️ 이미지 데이터가 없거나 올바르지 않아 복구할 수 없습니다.");
        return;
      }

      const blob = await (await fetch(recoveryData.imageDataUrl)).blob();
      const formData = new FormData();
      formData.append("image", blob, "thumbnail.png");

      const dataPayload = {
        distance: recoveryData.distance,
        time: recoveryData.time,
        pace: recoveryData.pace,
        pathGeoJson: recoveryData.pathGeoJson,
        startedTime: recoveryData.startedTime,
        endedTime: recoveryData.endedTime,
        startLatitude: recoveryData.startLatitude,
        startLongitude: recoveryData.startLongitude,
        endLatitude: recoveryData.endLatitude,
        endLongitude: recoveryData.endLongitude,
      };

      formData.append("data", new Blob([JSON.stringify(dataPayload)], { type: "application/json" }));

      const res = await authFetch("http://localhost:8080/running-record", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("복구 저장 실패");

      alert("✅ 기록이 복구되어 저장되었습니다!");
      localStorage.removeItem("unsavedRun");
      navigate("/myrecords");
    } catch (err) {
      console.error("❌ 복구 실패:", err);
      alert("복구 저장 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("unsavedRun");
    navigate("/recover");
  };

  const handlePermanentDelete = () => {
    if (window.confirm("이 기록을 복구하지 않고 완전히 삭제하시겠습니까?")) {
      localStorage.removeItem("unsavedRun");
      alert("🗑️ 복구 기록이 삭제되었습니다.");
      navigate("/home");
    } else {
      console.log("삭제가 취소되었습니다.");
    }
  };

  if (!recoveryData) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h2>📦 복구할 기록</h2>
      <p>
        <strong>거리:</strong> {recoveryData.distance} km
      </p>
      <p>
        <strong>시간:</strong> {recoveryData.time}초
      </p>
      <p>
        <strong>평균 페이스:</strong> {recoveryData.pace}
      </p>

      {recoveryData.imageDataUrl && (
        <div className={styles.thumbnailWrapper}>
          <h4>🖼️ 기록 썸네일</h4>
          <img src={recoveryData.imageDataUrl} alt='러닝 썸네일' className={styles.thumbnail} />
        </div>
      )}

      <div className={styles.buttons}>
        <button onClick={handleRestore}>✅ 복구하기</button>
        <button onClick={handlePermanentDelete}>🗑️ 삭제</button>
        <button onClick={handleCancel}>취소</button>
      </div>
    </div>
  );
};

export default RecoverPage;
