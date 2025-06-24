import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthFetch } from "../../utils/useAuthFetch";
import styles from "./courseDetail.module.css";
import CourseStatus from "./CourseStatus";

// ✅ 타입 정의
interface CourseDetail {
  id: number;
  userId: number;
  title: string;
  description: string;
  totalDistance: number;
  endLocationName: string;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface RunnerStat {
  runnerName: string;
  bestCompletionTimeSeconds: number;
  bestPace: number;
}

interface CourseStats {
  courseDistanceKm: number;
  totalCompletionCount: number;
  uniqueRunnerCount: number;
  averageCompletionTimeSeconds: number;
  averagePace: number;
  myCompletionCount: number;
  myBestTimeSeconds: number | null;
  myAveragePace: number | null;
  topRunners: RunnerStat[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user: currentUser, isAuthReady } = useAuth();
  const authFetch = useAuthFetch();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);

  const fetchCourse = async () => {
    if (!id) return;

    try {
      const res = await authFetch(`http://localhost:8080/course/${id}`);
      if (res.status === 401) {
        setError("로그인이 필요합니다.");
        return;
      }
      if (!res.ok) throw new Error("응답 실패");

      const data: CourseDetail = await res.json();
      setCourse(data);
    } catch (err) {
      console.error("코스 정보 로딩 실패:", err);
      setError("코스 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const fetchStats = async () => {
    if (!id) return;

    try {
      const res = await authFetch(`http://localhost:8080/course/${id}`);
      if (!res.ok) {
        if (res.status === 404) return;
        throw new Error("통계 요청 실패");
      }
      const data: CourseStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("통계 정보 로딩 실패:", err);
    }
  };

  useEffect(() => {
    console.log("현재 코스 id:", id);
    if (isAuthReady && accessToken && currentUser?.userId && id) {
      fetchCourse();
      fetchStats();
    }
  }, [isAuthReady, accessToken, currentUser?.userId, id]);

  const toggleLike = async () => {
    if (!id || !course) return;

    try {
      const res = await authFetch(`http://localhost:8080/like/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("좋아요 요청 실패");

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
            }
          : prev
      );
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const toggleBookmark = async () => {
    if (!id || !course) return;

    try {
      const res = await authFetch(`http://localhost:8080/course/bookmark/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked: !course.isBookmarked }),
      });

      if (!res.ok) throw new Error("북마크 요청 실패");

      setCourse((prev) => prev && { ...prev, isBookmarked: !prev.isBookmarked });
    } catch (err) {
      console.error("북마크 실패:", err);
    }
  };

  if (!isAuthReady || !accessToken || !currentUser?.userId) {
    return <p>🔒 로그인 정보를 확인 중입니다...</p>;
  }

  if (error) {
    return (
      <div>
        <p>❌ {error}</p>
        <button onClick={() => navigate("/")}>홈으로</button>
      </div>
    );
  }

  if (!course) {
    return <p>📦 코스 정보를 불러오는 중...</p>;
  }

  const isOwner = String(course.userId) === String(currentUser.userId);

  return (
    <div className={styles.container}>
      {stats && <CourseStatus stats={stats} courseId={Number(id)} />}
      <h2>🏁 {course.title}</h2>
      <p>📍 도착지: {course.endLocationName}</p>
      <p>📏 거리: {course.totalDistance} km</p>
      <p>❤️ 좋아요: {course.likeCount}</p>
      <p>📝 설명: {course.description || "설명이 없습니다."}</p>

      <div className={styles.buttonGroup}>
        {!isOwner && (
          <>
            <button onClick={toggleLike} className={styles.likeButton}>
              {course.isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"}
            </button>
            <button onClick={toggleBookmark} className={styles.bookmarkButton}>
              {course.isBookmarked ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
            </button>
          </>
        )}
        <button className={styles.followButton} onClick={() => navigate(`/run?courseId=${course.id}`)}>
          ▶️ 따라가기
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
