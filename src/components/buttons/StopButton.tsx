import styles from "../MapContainer.module.css";

interface StopButtonProps {
  onClick: () => void;
}

const StopButton = ({ onClick }: StopButtonProps) => (
  <button onClick={onClick} className={styles.stopButton}>
    🛑 러닝 종료
  </button>
);

export default StopButton;
