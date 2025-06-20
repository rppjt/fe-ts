import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthFetch } from "../utils/useAuthFetch";
import MapContainer from "../components/MapContainer";

// ✅ 코스 정보 타입 정의
interface CourseDetail {
  id: number;
  title: string;
  userName: string;
  // 필요하면 다른 필드도 추가
}

const RunPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const authFetch = useAuthFetch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        const res = await authFetch(`http://localhost:8080/course/${courseId}`);
        if (!res.ok) throw new Error("코스 정보 불러오기 실패");

        const data: CourseDetail = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("❌ 코스 정보 가져오기 실패:", err);
      }
    };

    fetchCourseDetail();
  }, [authFetch, courseId]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🏃 추천 코스 따라 달리기</h2>
      {course && (
        <p>
          📍 <strong>{course.userName}</strong> 님이 만든 코스입니다
        </p>
      )}
      {/* ✅ MapContainer는 내부에서 useLocation을 통해 courseId를 추출함 */}
      <MapContainer />
    </div>
  );
};

export default RunPage;
