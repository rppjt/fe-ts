import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MapContainer from "../components/MapContainer";
import authAxios from "../utils/authAxios";

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        const res = await authAxios.get<CourseDetail>(`/course/${courseId}`);
        setCourse(res.data); // ✅ Axios는 .data로 실제 응답 반환
      } catch (err) {
        console.error("❌ 코스 정보 가져오기 실패:", err);
      }
    };

    fetchCourseDetail();
  }, [courseId]);
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
