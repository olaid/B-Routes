export interface Area {
  id: string;
  name: string;
  polygon: [number, number][]; // エリアの境界座標（地図上の塗り分け用）
  walls: Wall[];
}

export interface Wall {
  id: string;
  name: string;
  coordinates: [number, number]; // 地図上のピン位置 [緯度, 経度]
  routes: Route[];
}

export interface Route {
  id: string;
  name: string;
  difficulty?: string;
  imageUrl: string; // 岩の画像URL
  vectors: {
    lines: Line[]; // ルートの線
    startHolds: Point[]; // スタートホールドの位置
    keyPoints: KeyPoint[]; // 重要なポイント
  };
  description?: string;
}

export interface Line {
  points: [number, number][]; // 画像上の座標 [x, y]（0-1の正規化座標）
  color?: string;
  width?: number;
}

export interface Point {
  position: [number, number]; // 画像上の座標（0-1の正規化座標）
  type: 'start' | 'hold' | 'finish';
  label?: string;
}

export interface KeyPoint {
  position: [number, number]; // 画像上の座標（0-1の正規化座標）
  description: string;
  icon?: string;
}

export interface AreasData {
  areas: Area[];
}

