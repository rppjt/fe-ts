// src/components/statistics/PersonalStatsCard.tsx
import React from "react";
import styles from "./personalStatsCard.module.css";

export interface BestMonth {
  month: number;
  activeDays: number;
}

export interface PersonalStatsData {
  longestDistance: number;
  fastestPace: number;
  longestTime: number;
  totalDistance: number;
  totalRuns: number;
  bestMonth?: BestMonth | null;
}

interface PersonalStatsCardProps {
  data: PersonalStatsData;
}

const formatDistance = (km: number): string => {
  if (!km) return "0km";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(2)}km`;
};

const formatPace = (pace: number): string => {
  if (!pace) return "기록 없음";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}분 ${seconds.toString().padStart(2, "0")}초/km`;
};

const formatTime = (seconds: number): string => {
  if (!seconds) return "0초";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0 ? `${hours}시간 ${minutes}분 ${secs}초` : `${minutes}분 ${secs}초`;
};

const formatBestMonth = (bestMonth?: BestMonth | null): string => {
  if (!bestMonth || bestMonth.month === 0) return "아직 기록 없음";
  const year = new Date().getFullYear();
  return `${year}년 ${bestMonth.month}월 (${bestMonth.activeDays}일)`;
};

const PersonalStatsCard: React.FC<PersonalStatsCardProps> = ({ data }) => {
  return (
    <div className={styles.statCard}>
      <h3>🏆 개인 기록</h3>
      <p>최장 거리: {formatDistance(data.longestDistance)}</p>
      <p>최고 속도: {formatPace(data.fastestPace)}</p>
      <p>최장 시간: {formatTime(data.longestTime)}</p>

      <hr />
      <h4>📌 누적 기록</h4>
      <p>총 거리: {formatDistance(data.totalDistance)}</p>
      <p>총 러닝 횟수: {data.totalRuns}회</p>

      <hr />
      <h4>🔥 올해 최고 활동</h4>
      <p>{formatBestMonth(data.bestMonth)}</p>
    </div>
  );
};

export default PersonalStatsCard;
