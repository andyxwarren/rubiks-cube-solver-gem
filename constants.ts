import { CubeColor, ColorMap, FaceName, RGB } from './types';

export const DEFAULT_COLOR_MAP: ColorMap = {
  [CubeColor.WHITE]: { r: 255, g: 255, b: 255 },
  [CubeColor.YELLOW]: { r: 255, g: 213, b: 0 },
  [CubeColor.RED]: { r: 183, g: 18, b: 52 },
  [CubeColor.ORANGE]: { r: 255, g: 88, b: 0 },
  [CubeColor.GREEN]: { r: 0, g: 155, b: 72 },
  [CubeColor.BLUE]: { r: 0, g: 70, b: 173 },
};

export const COLOR_NAMES: { [key in CubeColor]: string } = {
    [CubeColor.WHITE]: 'White',
    [CubeColor.YELLOW]: 'Yellow',
    [CubeColor.RED]: 'Red',
    [CubeColor.ORANGE]: 'Orange',
    [CubeColor.GREEN]: 'Green',
    [CubeColor.BLUE]: 'Blue',
};

export const COLOR_CLASSES: { [key in CubeColor]: string } = {
    [CubeColor.WHITE]: 'bg-white',
    [CubeColor.YELLOW]: 'bg-yellow-400',
    [CubeColor.RED]: 'bg-red-600',
    [CubeColor.ORANGE]: 'bg-orange-500',
    [CubeColor.GREEN]: 'bg-green-600',
    [CubeColor.BLUE]: 'bg-blue-600',
};

// This is the order the solver expects the faces in the final string.
export const FACE_ORDER: FaceName[] = ['F', 'U', 'R', 'D', 'L', 'B'];

export const FACE_CENTERS: { [key in FaceName]: CubeColor } = {
  F: CubeColor.GREEN,
  U: CubeColor.WHITE,
  R: CubeColor.RED,
  D: CubeColor.YELLOW,
  L: CubeColor.ORANGE,
  B: CubeColor.BLUE,
};

export const FACE_NAMES: { [key in FaceName]: string } = {
  F: 'Front (Green)',
  U: 'Up (White)',
  R: 'Right (Red)',
  D: 'Down (Yellow)',
  L: 'Left (Orange)',
  B: 'Back (Blue)',
};

// Defines which face should be oriented 'up' when scanning a given face.
export const ORIENTATION_GUIDE: { [key in FaceName]: FaceName } = {
  F: 'U', // When scanning Front (Green), keep Up (White) on top.
  R: 'U', // When scanning Right (Red), keep Up (White) on top.
  B: 'U', // When scanning Back (Blue), keep Up (White) on top.
  L: 'U', // When scanning Left (Orange), keep Up (White) on top.
  U: 'B', // When scanning Up (White), keep Back (Blue) on top.
  D: 'F', // When scanning Down (Yellow), keep Front (Green) on top.
};

// Defines the visual layout of the unfolded cube net.
export const CUBE_NET_LAYOUT: (FaceName | null)[][] = [
    [null, 'U', null],
    ['L',  'F', 'R' ],
    [null, 'D', null],
    [null, 'B', null],
];