import { useState } from "react";
import MyRecords from "../records/MyRecords";
import MyRecommendedCourses from "../records/MyRecommendedCourses";
import MyFavorites from "./MyFavorites";
import RecoverPage from "../recovery/RecoverPage";
import Friends from "./Friends";
import styles from "./myPage.module.css";

const MyPage: React.FC = () => {
  // ✅ 탭 타입 명시
  const [tab, setTab] = useState<"records" | "recommended" | "favorites" | "recover" | "friends">("records");

  return (
    <div className={styles.container}>
      <h1>📂 마이페이지</h1>

      <div className={styles.tabs}>
        <button onClick={() => setTab("records")} className={tab === "records" ? styles.active : ""}>
          📁 나의 기록
        </button>
        <button onClick={() => setTab("recommended")} className={tab === "recommended" ? styles.active : ""}>
          🏃 내가 만든 추천 코스
        </button>
        <button onClick={() => setTab("favorites")} className={tab === "favorites" ? styles.active : ""}>
          ⭐ 즐겨찾기한 코스
        </button>
        <button onClick={() => setTab("recover")} className={tab === "recover" ? styles.active : ""}>
          📦 복구
        </button>
        <button onClick={() => setTab("friends")} className={tab === "friends" ? styles.active : ""}>
          👥 친구들
        </button>
      </div>

      <div className={styles.content}>
        {tab === "records" && <MyRecords />}
        {tab === "recommended" && <MyRecommendedCourses />}
        {tab === "favorites" && <MyFavorites />}
        {tab === "recover" && <RecoverPage />}
        {tab === "friends" && <Friends />}
      </div>
    </div>
  );
};

export default MyPage;
