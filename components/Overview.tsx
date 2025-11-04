import React from 'react';
import { CubeState, FaceName } from '../types';
import { CUBE_NET_LAYOUT, FACE_CENTERS, COLOR_CLASSES, FACE_NAMES } from '../constants';
import { CameraIcon, PencilIcon, ExpandIcon, RefreshIcon } from './Icons';

interface OverviewProps {
  cubeState: CubeState;
  onScanRequest: (face: FaceName) => void;
  onEditRequest: (face: FaceName) => void;
  onSolve: () => void;
  onReset: () => void;
  error: string | null;
}

const Overview: React.FC<OverviewProps> = ({ cubeState, onScanRequest, onEditRequest, onSolve, onReset, error }) => {
  const scannedFacesCount = Object.keys(cubeState).length;
  const allFacesScanned = scannedFacesCount === 6;

  const getInstruction = () => {
    if (allFacesScanned) {
      return "All faces scanned. Ready to solve!";
    }
    if (scannedFacesCount === 0) {
      return "Select a face to scan from the layout below.";
    }
    return `Great! ${scannedFacesCount} of 6 faces scanned. Select the next face.`;
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col items-center justify-between p-4">
      <header className="w-full flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Cube Overview</h2>
        <div className="flex space-x-4">
          <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors" aria-label="Toggle Fullscreen">
            <ExpandIcon className="w-6 h-6" />
          </button>
          <button onClick={onReset} className="text-gray-400 hover:text-white transition-colors" aria-label="Start Over">
            <RefreshIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      <main className="flex flex-col items-center justify-center flex-grow w-full">
        <p className="text-gray-300 text-center mb-4 text-lg">{getInstruction()}</p>
        
        {error && (
            <div className="mb-4 p-3 w-full bg-red-900/50 border border-red-700/60 text-red-300 rounded-lg text-center">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="my-2">
          {CUBE_NET_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center" style={{ height: '7.5rem' }}>
              {row.map((faceName, colIndex) => {
                const faceContainerSize = 'w-28 h-28';
                if (!faceName) {
                  return <div key={`${rowIndex}-${colIndex}`} className={faceContainerSize} />;
                }
                const faceData = cubeState[faceName];
                const faceTitle = FACE_NAMES[faceName];

                return (
                  <div key={faceName} className={`${faceContainerSize} p-1 flex flex-col items-center justify-start text-center`}>
                     <span className="text-xs font-semibold mb-1 text-gray-400 h-8 flex items-center">{faceTitle}</span>
                     <div className="w-24 h-24">
                      {faceData ? (
                        <button
                          onClick={() => onEditRequest(faceName)}
                          className="w-full h-full rounded-lg bg-gray-800/60 flex items-center justify-center relative group p-1 ring-1 ring-white/5"
                          aria-label={`Edit ${faceTitle}`}
                        >
                          <div className="grid grid-cols-3 gap-px w-full h-full bg-black rounded-md">
                            {faceData.flat().map((color, index) => (
                                <div key={index} className={`w-full h-full ${COLOR_CLASSES[color]}`} />
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                            <PencilIcon className="w-6 h-6" />
                            <span className="font-semibold mt-1 text-xs uppercase">Edit</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => onScanRequest(faceName)}
                          className="w-full h-full rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex flex-col items-center justify-center text-white shadow-lg p-2 gap-2"
                          aria-label={`Scan ${faceTitle}`}
                        >
                          <div className="w-10 h-10 rounded-md border-2 border-white/20 flex items-center justify-center bg-gray-800 p-0.5">
                            <div className={`w-full h-full rounded-sm ${COLOR_CLASSES[FACE_CENTERS[faceName]]}`} />
                          </div>
                          <div className="flex items-center text-xs text-cyan-400">
                            <CameraIcon className="w-4 h-4 mr-1" />
                            <span>Scan</span>
                          </div>
                        </button>
                      )}
                     </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <footer className="flex space-x-4 w-full justify-center pt-4">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
        >
          Start Over
        </button>
        <button
          onClick={onSolve}
          disabled={!allFacesScanned}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-lg text-lg"
        >
          Solve It!
        </button>
      </footer>
    </div>
  );
};

export default Overview;