export interface FontManager {
  getAvailableFontsSync(): FontItem[];
}

export interface FontItem {
  family: string;
  italic: boolean;
  monospace: boolean;
  path: string;
  postscriptName: string;
  style: string;
  weight: number;
  width: number;
}
