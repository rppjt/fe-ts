export interface WeeklyStatsData {
  totalRuns: number;
  totalDistance: number;
  totalTime: number;
  averagePace: string;
  averageDistance: number;
  weekStart: string;
  weekEnd: string;
}

interface WeeklyStatsCardProps {
  data: WeeklyStatsData;
}

const WeeklyStatsCard = ({ data }: WeeklyStatsCardProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  return (
    <div className='stat-card'>
      <h3>🕒 주간 통계</h3>
      <p>총 로경: {data.totalRuns}회</p>
      <p>총 거리: {data.totalDistance}km</p>
      <p>총 시간: {formatTime(data.totalTime)}</p>
      <p>평균 페이스: {data.averagePace} 분/km</p>
      <p>평균 거리: {data.averageDistance}km</p>
      <p>
        복도: {data.weekStart} ~ {data.weekEnd}
      </p>
    </div>
  );
};

export default WeeklyStatsCard;
