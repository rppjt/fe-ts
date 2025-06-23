/// <reference types="react-scripts" />

declare global {
  interface Window {
    kakao: any;
  }

  interface ImportMetaEnv {
    readonly VITE_KAKAO_MAP_API_KEY: string;
    // 여기에 사용하는 다른 환경변수들도 추가할 수 있어
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // 선택적으로 아래처럼 명시적 타입도 추가 가능
  namespace kakao {
    namespace maps {
      class Map {
        setCenter(latlng: LatLng): void;
        setBounds(bounds: any): void;
        getCenter(): LatLng;
        panTo(latlng: LatLng): void;
      }
      class Marker {
        constructor(options: { position: LatLng });
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }
      class Polyline {
        constructor(options: { path: LatLng[] });
        setMap(map: Map | null): void;
        getPath(): LatLng[];
      }
    }
  }
}

export {};
