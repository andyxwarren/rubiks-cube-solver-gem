
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ColorMap, CubeColor, Face, FaceName, RGB } from '../types';
import { findClosestColor } from '../utils/color';
import { CameraIcon, SpinnerIcon } from './Icons';
import CubeFacePreview from './CubeFacePreview';
import { COLOR_CLASSES, FACE_NAMES } from '../constants';
import OrientationGuide from './OrientationGuide';

interface CameraViewProps {
  onScanComplete: (face: Face) => void;
  colorMap: ColorMap;
  faceToScan: FaceName;
  upFace: FaceName;
}

const CameraView: React.FC<CameraViewProps> = ({ onScanComplete, colorMap, faceToScan, upFace }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedFace, setScannedFace] = useState<Face | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.error("Video play failed:", err);
                setError("Could not play the camera stream.");
              });
              setIsCameraReady(true);
            }
          };
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setError('Could not access camera. Please check permissions and ensure it is not used by another application.');
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndProcessFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;
    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
        setError('Could not get canvas context.');
        setIsScanning(false);
        return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const face: Face = [];
    const gridSize = 3;
    const faceSize = Math.min(canvas.width, canvas.height) * 0.6; 
    const stickerSize = faceSize / gridSize;
    const startX = (canvas.width - faceSize) / 2;
    const startY = (canvas.height - faceSize) / 2;

    for (let row = 0; row < gridSize; row++) {
      const faceRow: CubeColor[] = [];
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * stickerSize + stickerSize / 2;
        const y = startY + row * stickerSize + stickerSize / 2;
        const pixel = context.getImageData(x, y, 1, 1).data;
        const rgb: RGB = { r: pixel[0], g: pixel[1], b: pixel[2] };
        const color = findClosestColor(rgb, colorMap);
        faceRow.push(color);
      }
      face.push(faceRow);
    }
    setScannedFace(face);
    setIsScanning(false);
  }, [colorMap, isScanning]);
  
  const handleStickerClick = (row: number, col: number) => {
    if (selectedSticker && selectedSticker.row === row && selectedSticker.col === col) {
      setSelectedSticker(null);
    } else {
      setSelectedSticker({ row, col });
    }
  };

  const handleColorCorrection = (newColor: CubeColor) => {
    if (!scannedFace || !selectedSticker) return;

    const newFace = scannedFace.map(r => [...r]);
    newFace[selectedSticker.row][selectedSticker.col] = newColor;

    setScannedFace(newFace);
    setSelectedSticker(null);
  };
  
  const handleRescan = () => {
    setScannedFace(null);
    setSelectedSticker(null);
  };

  if (error) {
    return <div className="text-red-400 p-4 text-center">{error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-2 max-w-lg mx-auto">
       <div className="text-center w-full">
        <h2 className="text-2xl font-bold mb-1">Scan: {FACE_NAMES[faceToScan]}</h2>
        {!scannedFace && (
            <div className="flex items-center justify-center my-1 gap-4 p-2 bg-gray-800/50 rounded-lg max-w-xs mx-auto">
                <OrientationGuide faceToScan={faceToScan} />
                <p className="text-gray-300 text-left text-sm flex-1">
                    Orient your cube to match.
                    <br/>
                    Keep the <strong>{FACE_NAMES[upFace]}</strong> face on top.
                </p>
            </div>
        )}
      </div>
      
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg border-4 border-gray-700 mb-1">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[60%] grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/40 backdrop-blur-sm bg-white/10"></div>
            ))}
          </div>
        </div>
        {!isCameraReady && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <SpinnerIcon className="w-12 h-12"/>
                <p className="ml-4">Starting camera...</p>
            </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {scannedFace ? (
        <div className="w-full flex flex-col items-center">
            <p className="mb-1 text-center h-8 flex items-center px-4">
              {selectedSticker ? 'Select the correct color for the highlighted square.' : "Tap any square to correct its color."}
            </p>
            <CubeFacePreview
              face={scannedFace}
              onStickerClick={handleStickerClick}
              selectedSticker={selectedSticker}
            />
            <div className="mt-1 p-2 h-16 w-full flex items-center justify-center">
              {selectedSticker && (
                  <div className="p-2 bg-gray-800 rounded-lg flex justify-center gap-2">
                      {Object.values(CubeColor).map(color => (
                          <button
                              key={color}
                              onClick={() => handleColorCorrection(color)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-700 hover:border-white transition-transform transform hover:scale-110 ${COLOR_CLASSES[color]}`}
                              aria-label={`Select ${color}`}
                          />
                      ))}
                  </div>
              )}
            </div>
            <div className="flex space-x-4 w-full">
                <button 
                    onClick={handleRescan}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg"
                >
                    Rescan
                </button>
                <button 
                    onClick={() => onScanComplete(scannedFace)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
                >
                    Confirm
                </button>
            </div>
        </div>
      ) : (
        <button
          onClick={captureAndProcessFace}
          disabled={!isCameraReady || isScanning}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg transition-colors"
        >
          {isScanning ? (
              <SpinnerIcon className="w-7 h-7 mr-3" />
          ) : (
              <CameraIcon className="w-7 h-7 mr-3" />
          )}
          {isScanning ? 'Scanning...' : 'Scan Face'}
        </button>
      )}
    </div>
  );
};

export default CameraView;