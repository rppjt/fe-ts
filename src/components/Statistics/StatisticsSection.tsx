import { useEffect, useState } from "react";
import authAxios from "../../utils/authAxios"; // Axios 인스턴스를 직접 import
import styles from "./StatisticsSection.module.css";
import PersonalStatsCard, { PersonalStatsData } from "./PersonalStatsCard";
import WeeklyStatsCard, { WeeklyStatsData } from "./WeeklyStatsCard";
import MonthlyStatsCard, { MonthlyStatsData } from "./MonthlyStatsCard";

const StatisticsSection = () => {
  const [personalStats, setPersonalStats] = useState<PersonalStatsData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [personalRes, weeklyRes, monthlyRes] = await Promise.all([
          authAxios.get<PersonalStatsData>("/stats/personal-best"),
          authAxios.get<WeeklyStatsData>("/stats/weekly"),
          authAxios.get<MonthlyStatsData>("/stats/monthly"),
        ]);

        setPersonalStats(personalRes.data);
        setWeeklyStats(weeklyRes.data);
        setMonthlyStats(monthlyRes.data);
      } catch (err) {
        console.error("📉 통계 데이터 로딩 실패:", err);
      }
    };

    fetchStats();
  }, []);

  if (!personalStats || !weeklyStats || !monthlyStats) {
    return <p>📊 통계 데이터를 불러오는 중...</p>;
  }

  return (
    <div className={styles.statisticsSection}>
      <PersonalStatsCard data={personalStats} />
      <WeeklyStatsCard data={weeklyStats} />
      <MonthlyStatsCard data={monthlyStats} />
    </div>
  );
};

export default StatisticsSection;
