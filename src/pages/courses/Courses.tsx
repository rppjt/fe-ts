import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./course.module.css";
import authAxios from "../../utils/authAxios";

// ✅ 코스 타입 정의
interface Course {
  id: number;
  endLocationName: string;
  totalDistance: number;
  likes: number;
  description?: string;
  bookmarked: boolean;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"LIKE" | "RECENT" | "DISTANCE">("LIKE");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await authAxios.get<Course[]>(`/course?sortType=${sortOption}`);
        setCourses(res.data);
      } catch (err) {
        console.error("코스 불러오기 실패:", err);
      }
    };

    fetchCourses();
  }, [sortOption]);

  const handleClick = (id?: number) => {
    if (id !== undefined) {
      navigate(`/course/${id}`);
    }
  };

  const toggleBookmark = async (courseId: number, isBookmarked: boolean) => {
    try {
      await authAxios.patch(`/course/bookmark/${courseId}`, {
        isBookmarked: !isBookmarked,
      });

      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, bookmarked: !isBookmarked } : c)));
    } catch (err) {
      console.error("즐겨찾기 실패:", err);
    }
  };

  const filteredCourses = courses.filter((course) =>
    (course.endLocationName + (course.description || "")).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>📚 추천 코스 전체 보기</h2>

      <div className={styles.controls}>
        <input
          type='text'
          placeholder='목적지 또는 설명 검색'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as "LIKE" | "RECENT" | "DISTANCE")}
          className={styles.sortSelect}
        >
          <option value='LIKE'>❤️ 좋아요순</option>
          <option value='RECENT'>🕒 최신순</option>
          <option value='DISTANCE'>📏 거리순</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <p>표시할 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.courseList}>
          {filteredCourses.map((course) => (
            <li key={course.id} className={styles.courseItem} onClick={() => handleClick(course.id)}>
              <img
                src='/course-default-thumbnail.jpg'
                alt={course.endLocationName || "코스"}
                className={styles.thumbnail}
              />
              <div className={styles.info}>
                <p className={styles.endLocationName}>{course.endLocationName || "목적지 미지정"}</p>
                <p>
                  {course.totalDistance} km | ❤️ {course.likes}
                </p>
                <p className={styles.description}>{course.description || "설명이 없습니다."}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(course.id, course.bookmarked);
                  }}
                >
                  {course.bookmarked ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Courses;
