import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../../utils/useAuthFetch";
import styles from "../mypage/myPage.module.css";

// ✅ 코스 타입 정의
interface Course {
  id: number;
  title: string;
  description?: string;
  totalDistance: number;
  likes: number;
  imageUrl?: string;
}

const MyRecommendedCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await authFetch("http://localhost:8080/course/my");
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("❌ 내가 만든 추천 코스 불러오기 실패:", err);
      }
    };

    fetchMyCourses();
  }, []);

  const handleClick = (id: number) => {
    navigate(`/course/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("정말 이 추천 코스를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await authFetch(`http://localhost:8080/course/${id}`, {
        method: "DELETE",
      });

      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("✅ 추천 코스가 삭제되었습니다");
    } catch (err) {
      console.error("❌ 추천 코스 삭제 실패:", err);
    }
  };

  const handleEditStart = (course: Course) => {
    setEditId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleEditSubmit = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/course/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (!res.ok) throw new Error("수정 실패");

      setCourses((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, title: editTitle, description: editDescription } : c))
      );

      handleEditCancel();
      alert("✏️ 추천 코스가 수정되었습니다");
      navigate(`/course/${editId}`);
    } catch (err) {
      console.error("❌ 수정 요청 실패:", err);
    }
  };

  return (
    <div>
      <h2>🏃 내가 만든 추천 코스</h2>
      {courses.length === 0 ? (
        <p>아직 등록한 추천 코스가 없습니다.</p>
      ) : (
        <ul className={styles.favoriteList}>
          {courses.map((course) => (
            <li
              key={course.id}
              className={styles.favoriteItem}
              onClick={() => {
                if (editId !== course.id) {
                  handleClick(course.id);
                }
              }}
            >
              {editId === course.id ? (
                <div className={styles.editForm}>
                  <input
                    type='text'
                    value={editTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder='코스 제목'
                  />
                  <textarea
                    rows={2}
                    value={editDescription}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder='코스 설명'
                  />
                  <div className={styles.editActions}>
                    <button onClick={handleEditSubmit}>💾 저장</button>
                    <button onClick={handleEditCancel}>❌ 취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.courseTitle}>{course.title}</p>
                  <p>
                    {course.totalDistance} km | ❤️ {course.likes}
                  </p>
                  <p>{course.description || "설명이 없습니다."}</p>
                  <img
                    src={course.imageUrl || "/course-default-thumbnail.jpg"}
                    alt={course.title}
                    className={styles.thumbnail}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(course);
                    }}
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                    className={styles.deleteButton}
                  >
                    🗑️ 삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecommendedCourses;
