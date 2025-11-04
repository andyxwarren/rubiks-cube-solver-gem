import React, { useState, useCallback } from 'react';
import { AppState, CubeColor, CubeState, ColorMap, Face, FaceName } from './types';
import { DEFAULT_COLOR_MAP, ORIENTATION_GUIDE } from './constants';
import CalibrationView from './components/CalibrationView';
import CameraView from './components/CameraView';
import SolutionDisplay from './components/SolutionDisplay';
import { solve } from './services/solver';
import { SpinnerIcon, CubeIcon } from './components/Icons';
import Overview from './components/Overview';
import EditFaceView from './components/EditFaceView';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [colorMap, setColorMap] = useState<ColorMap>(DEFAULT_COLOR_MAP);
  const [cubeState, setCubeState] = useState<CubeState>({});
  const [solution, setSolution] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [faceToScan, setFaceToScan] = useState<FaceName | null>(null);
  const [faceToEdit, setFaceToEdit] = useState<FaceName | null>(null);

  const handleCalibrationComplete = (newColorMap: ColorMap) => {
    setColorMap(newColorMap);
    setAppState(AppState.OVERVIEW);
  };
  
  const handleUseDefaults = () => {
      setAppState(AppState.OVERVIEW);
  };

  const handleScanRequest = (face: FaceName) => {
    setFaceToScan(face);
    setAppState(AppState.SCANNING);
  };
  
  const handleEditRequest = (face: FaceName) => {
    setFaceToEdit(face);
    setAppState(AppState.EDITING);
  };

  const handleScanComplete = (face: Face) => {
    if (!faceToScan) return; // Should not happen
    const newCubeState = { ...cubeState, [faceToScan]: face };
    setCubeState(newCubeState);
    setFaceToScan(null);
    setAppState(AppState.OVERVIEW);
  };
  
  const handleEditComplete = (face: Face) => {
    if (!faceToEdit) return;
    const newCubeState = { ...cubeState, [faceToEdit]: face };
    setCubeState(newCubeState);
    setFaceToEdit(null);
    setAppState(AppState.OVERVIEW);
  };

  const handleCancelEdit = () => {
    setFaceToEdit(null);
    setAppState(AppState.OVERVIEW);
  };

  const handleSolve = useCallback(() => {
    setAppState(AppState.SOLVING);
    setError(null);
    
    // Use a short timeout to make the UI transition smoother
    setTimeout(() => {
        try {
            const solutionResult = solve(cubeState);
            setSolution(solutionResult);
            setAppState(AppState.SOLVED);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Could not solve the cube. ${message} Please check if all faces are scanned correctly.`);
            console.error(err);
            setAppState(AppState.OVERVIEW);
        }
    }, 100);

  }, [cubeState]);
  
  const resetApp = () => {
    setAppState(AppState.WELCOME);
    setCubeState({});
    setSolution([]);
    setError(null);
    setFaceToScan(null);
    setFaceToEdit(null);
    setColorMap(DEFAULT_COLOR_MAP);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <CubeIcon className="w-24 h-24 mb-6 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rubik's Cube Solver</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              Use your camera to scan each face of your Rubik's Cube and get the solution steps.
            </p>
            <button
              onClick={() => setAppState(AppState.CALIBRATION_START)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
              Start Solving
            </button>
          </div>
        );
      case AppState.CALIBRATION_START:
        return (
           <div className="flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-3xl font-bold mb-4">Color Setup</h2>
            <p className="text-gray-300 mb-8 max-w-lg">
                Most cubes use standard colors. If yours is different, you can calibrate them. Otherwise, proceed with the defaults.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                 <button
                    onClick={() => setAppState(AppState.CALIBRATING)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Calibrate Colors
                </button>
                <button
                    onClick={handleUseDefaults}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Use Defaults & Scan
                </button>
            </div>
           </div>
        );
      case AppState.CALIBRATING:
        return <CalibrationView initialColorMap={colorMap} onCalibrationComplete={handleCalibrationComplete} />;
      case AppState.OVERVIEW:
        return <Overview 
                  cubeState={cubeState} 
                  onScanRequest={handleScanRequest} 
                  onEditRequest={handleEditRequest}
                  onSolve={handleSolve} 
                  onReset={resetApp}
                  error={error}
                />;
      case AppState.SCANNING:
        if (!faceToScan) return <p>Error: No face selected for scanning.</p>;
        const upFace = ORIENTATION_GUIDE[faceToScan];
        return <CameraView 
                  onScanComplete={handleScanComplete} 
                  colorMap={colorMap} 
                  faceToScan={faceToScan}
                  upFace={upFace}
                  key={faceToScan}
                />;
      case AppState.EDITING: {
        if (!faceToEdit || !cubeState[faceToEdit]) {
          setAppState(AppState.OVERVIEW);
          setFaceToEdit(null);
          return <p>Error: No face selected for editing. Returning to overview.</p>;
        }
        return <EditFaceView
          faceToEdit={faceToEdit}
          initialFace={cubeState[faceToEdit]!}
          onSave={handleEditComplete}
          onCancel={handleCancelEdit}
          onRescanRequest={handleScanRequest}
        />;
      }
      case AppState.SOLVING:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <SpinnerIcon className="w-16 h-16 mb-4" />
            <h2 className="text-3xl font-bold">Calculating Solution...</h2>
            <p className="text-gray-300">The solver is working its magic.</p>
          </div>
        );
      case AppState.SOLVED:
        return <SolutionDisplay initialCubeState={cubeState} solution={solution} onReset={resetApp} />;
      default:
        return <p>Unknown state</p>;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;