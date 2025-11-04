
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ColorMap, CubeColor, RGB } from '../types';
import { COLOR_NAMES } from '../constants';
import { CameraIcon, CheckCircleIcon, SpinnerIcon } from './Icons';

interface CalibrationViewProps {
  initialColorMap: ColorMap;
  onCalibrationComplete: (newColorMap: ColorMap) => void;
}

const colorsToCalibrate: CubeColor[] = [
  CubeColor.WHITE, CubeColor.YELLOW, CubeColor.RED,
  CubeColor.ORANGE, CubeColor.GREEN, CubeColor.BLUE,
];

const CalibrationView: React.FC<CalibrationViewProps> = ({ initialColorMap, onCalibrationComplete }) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [colorMap, setColorMap] = useState<ColorMap>(initialColorMap);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
        }
      } catch (err) {
        setError('Could not access camera. Please check permissions.');
      }
    };
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureColor = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const pixel = context.getImageData(x, y, 1, 1).data;
    const newRgb: RGB = { r: pixel[0], g: pixel[1], b: pixel[2] };

    const colorToUpdate = colorsToCalibrate[currentColorIndex];
    setColorMap(prevMap => ({ ...prevMap, [colorToUpdate]: newRgb }));

    if (currentColorIndex < colorsToCalibrate.length - 1) {
      setCurrentColorIndex(currentColorIndex + 1);
    } else {
      onCalibrationComplete({ ...colorMap, [colorToUpdate]: newRgb });
    }
  }, [currentColorIndex, onCalibrationComplete, colorMap]);

  if (error) return <div className="text-red-400">{error}</div>;

  const currentColor = colorsToCalibrate[currentColorIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-around max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">Color Calibration</h2>
      <p className="text-gray-300 mb-2 text-center">Point the center reticle at the {COLOR_NAMES[currentColor]} center piece and capture.</p>

      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg border-4 border-gray-700 mb-2">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 absolute"></div>
        </div>
        {!isCameraReady && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><SpinnerIcon className="w-12 h-12"/></div>}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={captureColor}
        disabled={!isCameraReady}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg"
      >
        <CameraIcon className="w-7 h-7 mr-3" />
        Capture {COLOR_NAMES[currentColor]}
      </button>

      <div className="grid grid-cols-6 gap-2 mt-4 w-full">
        {colorsToCalibrate.map((color, index) => {
            const rgb = colorMap[color];
            return (
                <div key={color} className={`relative p-1 rounded-md ${index === currentColorIndex ? 'bg-cyan-500' : 'bg-transparent'}`}>
                    <div className="w-full aspect-square rounded" style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}>
                        {index < currentColorIndex && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                <CheckCircleIcon className="w-6 h-6 text-green-400" />
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default CalibrationView;
