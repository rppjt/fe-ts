import styles from "../MapContainer.module.css";

interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
}

const SaveCancelButtons = ({ onSave, onCancel }: SaveCancelButtonsProps) => (
  <div className={styles.buttonGroup}>
    <button onClick={onSave}>저장하기</button>
    <button onClick={onCancel}>취소하기</button>
  </div>
);

export default SaveCancelButtons;
