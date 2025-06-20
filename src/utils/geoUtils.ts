/**
 * 위도/경도 두 점 사이의 거리를 미터(m) 단위로 반환합니다.
 * (Haversine 공식 사용)
 */
export function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 지구 반지름 (m)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 경로(path) 배열을 GeoJSON LineString 형태로 변환합니다.
 * 예: [{ lat, lng }, ...] → { type: 'LineString', coordinates: [[lng, lat], ...] }
 */
interface LatLng {
  lat: number;
  lng: number;
}

interface GeoJsonLineString {
  type: "LineString";
  coordinates: [number, number][];
}

export function convertPathToGeoJSON(path: LatLng[]): GeoJsonLineString {
  return {
    type: "LineString",
    coordinates: path.map((p) => [p.lng, p.lat]),
  };
}

/**
 * 경로 배열의 총 거리(km)를 계산합니다.
 */
export function calculateDistanceFromPath(path: LatLng[]): number {
  if (path.length < 2) return 0;
  const toRad = (value: number) => (value * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const { lat: lat1, lng: lng1 } = path[i - 1];
    const { lat: lat2, lng: lng2 } = path[i];
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return total;
}
