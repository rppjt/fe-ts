import { useState, useEffect } from "react";
import styles from "./editCourseModal.module.css";
import authAxios from "../../utils/authAxios"; // ✅ axios 인스턴스 import

// ✅ props 타입 정의
interface EditCourseModalProps {
  course: {
    id: number;
    title: string;
    description: string;
  };
  onClose: () => void;
  onSave: (updatedCourse: { id: number; title: string; description: string }) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description);
  }, [course]);

  const handleSave = async () => {
    if (title.trim() === "") {
      alert("제목은 비워둘 수 없습니다.");
      return;
    }

    if (title === course.title && description === course.description) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authAxios.patch(`/course/${course.id}`, {
        title,
        description,
      });

      onSave(res.data);
      onClose();
    } catch (err: any) {
      console.error("❌ 수정 중 오류:", err);
      alert("수정 중 오류 발생: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>추천 코스 수정</h2>

        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} />

        <label>설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} />

        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isSubmitting}
          >
            저장
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
