// CourseStats.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthFetch } from "../../utils/useAuthFetch";
import { formatElapsedTime, formatPace } from "../../utils/timeUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface RunnerStat {
  runnerName: string;
  bestCompletionTimeSeconds: number;
  bestPace: number;
}

interface CourseStats {
  courseId: number;
  courseTitle: string;
  creatorName: string;
  courseDistanceKm: number;
  totalCompletionCount: number;
  uniqueRunnerCount: number;
  averageCompletionTimeSeconds: number;
  averagePace: number;
  myCompletionCount: number;
  myBestTimeSeconds: number | null;
  myAveragePace: number | null;
  topRunners: RunnerStat[];
}

const CourseStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [stats, setStats] = useState<CourseStats | null>(null);

  useEffect(() => {
    authFetch(`/stats/recommended-course/${id}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => alert("코스 통계를 불러오지 못했습니다."));
  }, [id]);

  if (!stats) return <div>불러오는 중...</div>;

  const paceData = [
    { name: "평균", pace: stats.averagePace },
    { name: "나", pace: stats.myAveragePace ?? 0 },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>{stats.courseTitle}</h2>
      <p>🏃 거리: {stats.courseDistanceKm}km</p>
      <p>🔥 총 완주: {stats.totalCompletionCount}명</p>
      <p>👥 참여자: {stats.uniqueRunnerCount}명</p>
      <p>⏱️ 평균 시간: {formatElapsedTime(stats.averageCompletionTimeSeconds)}</p>

      <h3>📊 내 기록</h3>
      <p>완주 횟수: {stats.myCompletionCount}회</p>
      <p>최고 기록: {stats.myBestTimeSeconds ? formatElapsedTime(stats.myBestTimeSeconds) : "없음"}</p>

      <ResponsiveContainer width='100%' height={220}>
        <BarChart data={paceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)} 분/km`} />
          <Bar dataKey='pace' fill='#8884d8'>
            <LabelList
              dataKey='pace'
              position='top'
              formatter={(label: any) => {
                const value = label.value;
                return `${Number(value).toFixed(1)}분`;
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <h3>🏅 TOP 러너</h3>
      {stats.topRunners.map((runner, i) => (
        <div key={runner.runnerName} style={{ marginBottom: "8px" }}>
          {i + 1}위 - {runner.runnerName} | 기록: {formatElapsedTime(runner.bestCompletionTimeSeconds)} | 페이스:{" "}
          {formatPace(runner.bestCompletionTimeSeconds, stats.courseDistanceKm)}
        </div>
      ))}

      <button
        onClick={() => navigate(`/run?courseId=${stats.courseId}`)}
        style={{ marginTop: "20px", padding: "10px 20px", fontWeight: "bold" }}
      >
        🏃 이 코스로 도전하기
      </button>
    </div>
  );
};

export default CourseStats;
