/**
 * ⏱️ 초 단위를 "hh:mm:ss" 형식 문자열로 변환합니다.
 * @param seconds 총 초 단위 시간
 * @returns 포맷된 문자열 (예: "01:05:07")
 */
export const formatElapsedTime = (seconds: number): string => {
  if (seconds == null || isNaN(seconds) || seconds < 1) return "기록 없음";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

/**
 * 🏃 시간(초)과 거리(km) 기준 페이스를 mm'ss" 형식 문자열로 반환합니다.
 * @param timeSec 총 러닝 시간(초)
 * @param distanceKm 총 거리(km)
 * @returns 포맷된 페이스 문자열 (예: "05'30\"")
 */
export const formatPace = (timeSec: number, distanceKm: number): string => {
  if (distanceKm === 0) return "0'00\"";
  const paceSec = timeSec / distanceKm;
  const min = Math.floor(paceSec / 60);
  const sec = Math.floor(paceSec % 60);
  return `${min}'${sec.toString().padStart(2, "0")}"`;
};
