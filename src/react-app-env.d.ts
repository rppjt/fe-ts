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
        setCenter(latlng: any): void;
        setBounds(bounds: any): void;
        getCenter(): LatLng;
      }
      class Marker {
        constructor(options: any);
        setMap(map: Map | null): void;
        setPosition(latlng: any): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }
      class Polyline {
        constructor(options: any);
        setMap(map: any): void;
        getPath(): LatLng[];
      }
    }
  }
}

export {};
