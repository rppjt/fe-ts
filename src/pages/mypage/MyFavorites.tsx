import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authAxios from "../../utils/authAxios";
import styles from "./myPage.module.css";

// ✅ 즐겨찾기 코스 타입 정의
interface FavoriteCourse {
  courseId: number;
  title: string;
  totalDistance: number;
  imageUrl?: string;
}

const MyFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await authAxios.get<FavoriteCourse[]>("/course/bookmark/my");
        setFavorites(res.data);
      } catch (err) {
        console.error("❌ 즐겨찾기한 코스 불러오기 실패:", err);
      }
    };

    fetchFavorites();
  }, []);

  const handleClick = (id: number) => {
    navigate(`/course/${id}`);
  };

  const toggleBookmark = async (courseId: number) => {
    try {
      await authAxios.patch(`/course/bookmark/${courseId}`, {
        isBookmarked: false,
      });
      setFavorites((prev) => prev.filter((c) => c.courseId !== courseId));
    } catch (err) {
      console.error("❌ 즐겨찾기 해제 실패:", err);
    }
  };

  return (
    <div>
      <h2>⭐ 내가 즐겨찾기한 코스</h2>
      {favorites.length === 0 ? (
        <p>아직 즐겨찾기한 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {favorites.map((course) => (
            <li key={course.courseId} className={styles.favoriteItem} onClick={() => handleClick(course.courseId)}>
              <p className={styles.endLocationName}>{course.title}</p>
              <p>{course.totalDistance} km</p>

              <img
                src={course.imageUrl || "/course-default-thumbnail.jpg"}
                alt={course.title}
                className={styles.thumbnail}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(course.courseId);
                }}
              >
                ⭐ 즐겨찾기 해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyFavorites;
