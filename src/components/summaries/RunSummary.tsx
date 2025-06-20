import styles from "../MapContainer.module.css";
import SaveCancelButtons from "../buttons/SaveCancelButtons";
import { formatElapsedTime } from "../../utils/timeUtils";

interface RunSummaryProps {
  elapsedTime: number;
  distance: number;
  pace: string;
  onSave: () => void;
  onCancel: () => void;
}

const RunSummary = ({ elapsedTime, distance, pace, onSave, onCancel }: RunSummaryProps) => (
  <div className={styles.summaryBox}>
    <h3>🏁 러닝 요약</h3>
    <p>
      <strong>Total Time:</strong> {formatElapsedTime(elapsedTime)}
    </p>
    <p>
      <strong>Distance:</strong> {distance.toFixed(2)} km
    </p>
    <p>
      <strong>Average Pace:</strong> {pace}
    </p>
    <SaveCancelButtons onSave={onSave} onCancel={onCancel} />
  </div>
);

export default RunSummary;
