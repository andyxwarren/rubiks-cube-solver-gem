
import { CubeColor, ColorMap, RGB } from '../types';

export function getEuclideanDistance(color1: RGB, color2: RGB): number {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

export function findClosestColor(rgb: RGB, colorMap: ColorMap): CubeColor {
  let minDistance = Infinity;
  let closestColor: CubeColor = CubeColor.WHITE;

  for (const key in colorMap) {
    const colorEnum = key as CubeColor;
    const distance = getEuclideanDistance(rgb, colorMap[colorEnum]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorEnum;
    }
  }
  return closestColor;
}
