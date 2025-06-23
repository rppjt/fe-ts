import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PopularCourse {
  courseId: number;
  courseTitle: string;
  creatorName: string;
  distanceKm: number;
  totalCompletionCount: number;
  uniqueRunnerCount: number;
  averagePace: number;
}

const PopularCourses = () => {
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/stats/popular-courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {courses.map((course) => (
        <div key={course.courseId} className='course-card' onClick={() => navigate(`/course/${course.courseId}`)}>
          <h3>{course.courseTitle}</h3>
          <p>🏃 {course.distanceKm.toFixed(1)}km</p>
          <p>🔥 {course.totalCompletionCount}명 완주</p>
          <p>👥 {course.uniqueRunnerCount}명 참여</p>
          <p>⏱️ {course.averagePace.toFixed(1)}분/km</p>
        </div>
      ))}
    </div>
  );
};

export default PopularCourses;
