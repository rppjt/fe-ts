import styles from "../MapContainer.module.css";

interface StartButtonProps {
  onClick: () => void;
}

const StartButton = ({ onClick }: StartButtonProps) => (
  <button onClick={onClick} className={styles.runButton}>
    🏃 러닝 시작
  </button>
);

export default StartButton;
