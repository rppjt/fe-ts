import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./myRecords.module.css";
import authAxios from "../../utils/authAxios";
import { useAuth } from "../../contexts/AuthContext";
import PersonalStatsCard, { PersonalStatsData } from "../../components/Statistics/PersonalStatsCard";
import WeeklyStatsCard, { WeeklyStatsData } from "../../components/Statistics/WeeklyStatsCard";
import MonthlyStatsCard, { MonthlyStatsData } from "../../components/Statistics/MonthlyStatsCard";

// ✅ 러닝 기록 타입
interface RunningRecord {
  id: number;
  createAt: string; // 또는 createdAt (서버 필드명 확인)
  totalDistance: number;
  totalTime: number;
  pace: string;
}

const MyRecords: React.FC = () => {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalStatsData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsData | null>(null);
  const navigate = useNavigate();
  const { isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchAllStats = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          authAxios.get<PersonalStatsData>("/stats/personal-best"),
          authAxios.get<WeeklyStatsData>("/stats/weekly"),
          authAxios.get<MonthlyStatsData>("/stats/monthly"),
        ]);

        setPersonalStats(res1.data);
        setWeeklyStats(res2.data);
        setMonthlyStats(res3.data);
      } catch (err) {
        console.error("❌ 통계 불러오기 오류:", err);
      }
    };

    const fetchRecords = async () => {
      try {
        const res = await authAxios.get<RunningRecord[]>("/running-record");
        setRecords(res.data);
      } catch (err) {
        console.error("❌ 기록 불러오기 오류:", err);
      }
    };

    fetchAllStats();
    fetchRecords();
  }, [isAuthReady]);

  const handleClick = (id: number) => {
    navigate(`/my-records/${id}`);
  };

  return (
    <div className={styles.container}>
      <h2>📊 나의 통계</h2>
      <div className={styles.statsRow}>
        {personalStats && <PersonalStatsCard data={personalStats} />}
        {weeklyStats && <WeeklyStatsCard data={weeklyStats} />}
        {monthlyStats && <MonthlyStatsCard data={monthlyStats} />}
      </div>
      <h2 style={{ marginTop: "2rem" }}>📜 나의 러닝 기록</h2>
      {records.length === 0 ? (
        <p>기록이 없습니다.</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((record) => (
            <li key={record.id} className={styles.recordItem} onClick={() => handleClick(record.id)}>
              <p>
                <strong>날짜:</strong> {new Date(record.createAt).toLocaleDateString()}
              </p>
              <p>
                <strong>거리:</strong> {record.totalDistance} km
              </p>
              <p>
                <strong>시간:</strong> {Math.floor(record.totalTime / 60)}분 {record.totalTime % 60}초
              </p>
              <p>
                <strong>페이스:</strong> {record.pace}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRecords;
