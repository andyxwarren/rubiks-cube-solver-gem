import React from 'react';
import { FaceName, CubeColor } from '../types';
import { COLOR_CLASSES } from '../constants';

interface OrientationGuideProps {
  faceToScan: FaceName;
}

const CUBE_FACES: Record<FaceName, CubeColor> = {
  F: CubeColor.GREEN,
  B: CubeColor.BLUE,
  U: CubeColor.WHITE,
  D: CubeColor.YELLOW,
  L: CubeColor.ORANGE,
  R: CubeColor.RED,
};

const OrientationGuide: React.FC<OrientationGuideProps> = ({ faceToScan }) => {
  const animationClass = faceToScan !== 'F' ? `orient-anim-${faceToScan}` : '';

  return (
    <div className="orientation-scene">
      <div className={`orientation-cube ${animationClass}`}>
        {Object.entries(CUBE_FACES).map(([face, color]) => (
          <div
            key={face}
            className={`orientation-face orientation-face-${face} ${COLOR_CLASSES[color]}`}
          >
            <span className="text-4xl">{face}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrientationGuide;
