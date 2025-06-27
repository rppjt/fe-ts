import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authAxios from "../../utils/authAxios";
import styles from "./courseDetail.module.css";
import CourseStatus from "./CourseStatus";

// ✅ 타입 정의
interface CourseDetail {
  id: number;
  userId: number;
  userName: string;
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
  courseId: number;
  courseTitle: string;
  creatorName: string;
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

  const [course, setCourse] = useState<(CourseDetail & CourseStats) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState(false);

  const fetchCourseWithStatus = async () => {
    if (!id) return;

    try {
      const res = await authAxios.get<CourseDetail & CourseStats>(`/course/${id}`);
      const data = res.data;
      setCourse(data);

      if (data.totalCompletionCount === undefined || data.topRunners === undefined) {
        setStatsError(true);
      } else {
        setStatsError(false);
      }
    } catch (err) {
      console.error("코스 정보 로딩 실패:", err);
      setError("❌ 코스 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (isAuthReady && accessToken && currentUser?.userId && id) {
      fetchCourseWithStatus();
    }
  }, [isAuthReady, accessToken, currentUser?.userId, id]);

  const toggleLike = async () => {
    if (!id || !course) return;

    try {
      await authAxios.post(`/like/${id}`);
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
      await authAxios.patch(`/course/bookmark/${id}`, {
        isBookmarked: !course.isBookmarked,
      });
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
      <h2>🏁 {course.title}</h2>
      <p>🏃‍♂️ {course.userName}님이 만든 러닝 코스!</p>
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
      {course && <CourseStatus stats={course} courseId={course.id} />}
    </div>
  );
};

export default CourseDetail;
