export enum CubeColor {
  WHITE = 'W',
  YELLOW = 'Y',
  RED = 'R',
  ORANGE = 'O',
  GREEN = 'G',
  BLUE = 'B',
}

export type FaceName = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

export type Face = CubeColor[][];

export type CubeState = {
  [key in FaceName]?: Face;
};

export type RGB = { r: number; g: number; b: number };

export type ColorMap = {
  [key in CubeColor]: RGB;
};

export enum AppState {
  WELCOME,
  CALIBRATION_START,
  CALIBRATING,
  OVERVIEW,
  SCANNING,
  EDITING,
  SOLVING,
  SOLVED,
}