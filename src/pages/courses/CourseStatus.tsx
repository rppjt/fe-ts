import { useNavigate } from "react-router-dom";
import styles from "./courseStatus.module.css";
import { formatElapsedTime } from "../../utils/timeUtils";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface RunnerStat {
  runnerName: string;
  bestCompletionTimeSeconds: number;
  bestPace: number;
}

interface CourseStatusProps {
  stats: {
    courseDistanceKm: number;
    totalCompletionCount: number;
    uniqueRunnerCount: number;
    averageCompletionTimeSeconds: number;
    averagePace: number;
    myCompletionCount: number;
    myBestTimeSeconds: number | null;
    myAveragePace: number | null;
    topRunners: RunnerStat[];
  };
  courseId: number;
}

const CourseStatus = ({ stats, courseId }: CourseStatusProps) => {
  const navigate = useNavigate();

  console.log("🚀 CourseStatus 렌더링됨");
  console.log("📦 courseId:", courseId);
  console.log("📊 stats:", stats);
  alert("✅ CourseStatus 컴포넌트가 실행됨");
  alert("🧪 CourseStatus 진입했는지 테스트 중");

  const paceData = [
    { name: "평균", pace: stats.averagePace },
    { name: "나", pace: stats.myAveragePace ?? 0 },
  ];

  useEffect(() => {
    console.log("🚀 CourseStatus 렌더링됨");
    console.log("📊 받은 stats:", stats);
  }, [stats]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 인기 추천코스 통계</h2>

      <div className={styles.scrollBox}>
        <p>🔥 총 완주: {stats.totalCompletionCount}명</p>
        <p>👥 참여자 수: {stats.uniqueRunnerCount}명</p>
        <p>⏱ 평균 시간: {formatElapsedTime(stats.averageCompletionTimeSeconds)}</p>

        <h4 className={styles.sectionTitle}>🙋‍♂️ 내 기록</h4>
        <p>✅ 내가 완주한 횟수: {stats.myCompletionCount}회</p>
        <p>🏁 최고 기록: {stats.myBestTimeSeconds ? formatElapsedTime(stats.myBestTimeSeconds) : "기록 없음"}</p>

        <ResponsiveContainer width='100%' height={220}>
          <BarChart data={paceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} 분/km`} />
            <Bar dataKey='pace' fill='#8884d8'>
              <LabelList dataKey='pace' position='top' formatter={(value) => `${Number(value).toFixed(1)}분`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <h4 className={styles.sectionTitle}>🏆 상위 러너</h4>
        <ul className={styles.runnerList}>
          {stats.topRunners.map((runner, i) => (
            <li key={runner.runnerName}>
              {i + 1}위 {runner.runnerName} | 기록: {formatElapsedTime(runner.bestCompletionTimeSeconds)} | 페이스:{" "}
              {runner.bestPace.toFixed(1)}분/km
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseStatus;
