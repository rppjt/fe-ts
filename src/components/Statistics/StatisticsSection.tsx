import { useEffect, useState } from "react";
import { useAuthFetch } from "../../utils/useAuthFetch";
import styles from "./StatisticsSection.module.css";
import PersonalStatsCard, { PersonalStatsData } from "./PersonalStatsCard";
import WeeklyStatsCard, { WeeklyStatsData } from "./WeeklyStatsCard";
import MonthlyStatsCard, { MonthlyStatsData } from "./MonthlyStatsCard";

const StatisticsSection = () => {
  const authFetch = useAuthFetch();

  const [personalStats, setPersonalStats] = useState<PersonalStatsData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [personalRes, weeklyRes, monthlyRes] = await Promise.all([
          authFetch("http://localhost:8080/stats/personal-best"),
          authFetch("http://localhost:8080/stats/weekly"),
          authFetch("http://localhost:8080/stats/monthly"),
        ]);

        const personalData: PersonalStatsData = await personalRes.json();
        const weeklyData: WeeklyStatsData = await weeklyRes.json();
        const monthlyData: MonthlyStatsData = await monthlyRes.json();

        setPersonalStats(personalData);
        setWeeklyStats(weeklyData);
        setMonthlyStats(monthlyData);
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
