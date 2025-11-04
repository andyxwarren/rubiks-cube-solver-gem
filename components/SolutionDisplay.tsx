import React, { useState, useCallback, useEffect } from 'react';
import AnimatedCube from './AnimatedCube';
import { 
    ArrowLeftCircleIcon, ArrowRightCircleIcon, RefreshIcon, ExpandIcon,
    ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon 
} from './Icons';
import { CubeState } from '../types';

interface SolutionDisplayProps {
  initialCubeState: CubeState;
  solution: string[];
  onReset: () => void;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ initialCubeState, solution, onReset }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [rotation, setRotation] = useState({ x: -30, y: -45 });

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, solution.length));
  }, [solution.length]);
  
  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, -1));
  }, []);
  
  const handleRotate = (axis: 'x' | 'y', direction: number) => {
    setRotation(prev => ({
        ...prev,
        [axis]: prev[axis] + 90 * direction
    }));
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
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

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') handleNext();
          else if (e.key === 'ArrowLeft') handlePrev();
          else if (e.key === 'ArrowUp') handleRotate('x', -1);
          else if (e.key === 'ArrowDown') handleRotate('x', 1);
          else if (e.key === 'h' || e.key === 'H') handleRotate('y', -1);
          else if (e.key === 'l' || e.key === 'L') handleRotate('y', 1);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [handleNext, handlePrev]);

  const isSolvedState = currentStep === solution.length;
  const currentMove = currentStep >= 0 && currentStep < solution.length ? solution[currentStep] : '';

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-between text-center bg-gray-900">
      <main className="flex flex-col items-center justify-center flex-grow w-full">
        <div className="w-full max-w-md mx-auto flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-300">Rubik's Cube Solver</h1>
            <div className="flex space-x-4">
                 <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors" aria-label="Toggle Fullscreen">
                    <ExpandIcon className="w-6 h-6" />
                </button>
                <button onClick={onReset} className="text-gray-400 hover:text-white transition-colors" aria-label="Start Over">
                    <RefreshIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        <h2 className="text-4xl font-bold mb-1 text-cyan-400">Solution Found!</h2>
        <p className="text-gray-400 mb-2">Follow the steps below to solve your cube.</p>

        <div className="relative" style={{'--cube-size': '200px'}}>
             <AnimatedCube 
                initialState={initialCubeState}
                solution={solution}
                currentStep={currentStep}
                rotation={rotation}
            />
            
            {/* Rotation Controls */}
            <button onClick={() => handleRotate('x', -1)} className="absolute -top-4 left-1/2 -translate-x-1/2 p-2 text-gray-400 hover:text-white" aria-label="Rotate cube up"><ChevronUpIcon className="w-8 h-8" /></button>
            <button onClick={() => handleRotate('x', 1)} className="absolute -bottom-4 left-1/2 -translate-x-1/2 p-2 text-gray-400 hover:text-white" aria-label="Rotate cube down"><ChevronDownIcon className="w-8 h-8" /></button>
            <button onClick={() => handleRotate('y', -1)} className="absolute -left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white" aria-label="Rotate cube left"><ChevronLeftIcon className="w-8 h-8" /></button>
            <button onClick={() => handleRotate('y', 1)} className="absolute -right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white" aria-label="Rotate cube right"><ChevronRightIcon className="w-8 h-8" /></button>
        </div>
        
        <div className="flex items-center space-x-6 my-6">
          <button onClick={handlePrev} disabled={currentStep < 0} className="disabled:opacity-30 transition-opacity" aria-label="Previous Move">
            <ArrowLeftCircleIcon className="w-12 h-12" />
          </button>
          <div className="text-center font-mono w-32">
            {isSolvedState ? (
                 <span className="font-bold text-2xl h-12 flex items-center justify-center text-white">Solved</span>
            ) : (
                <>
                    <span className="text-xl text-gray-400">
                      {currentStep >= 0 ? `${currentStep + 1} / ${solution.length}` : 'Start'}
                    </span>
                    <span className="font-bold text-4xl h-12 block text-white flex items-center justify-center">{currentMove}</span>
                </>
            )}
          </div>
          <button onClick={handleNext} disabled={currentStep >= solution.length} className="disabled:opacity-30 transition-opacity" aria-label="Next Move">
            <ArrowRightCircleIcon className="w-12 h-12" />
          </button>
        </div>

        <div className="w-full max-w-md h-40 flex justify-center items-center">
          <div className="grid grid-cols-6 gap-2 p-3 bg-gray-800 rounded-lg overflow-y-auto h-full w-full">
            {solution.map((move, index) => (
              <button 
                key={index} 
                onClick={() => handleStepClick(index)}
                className={`font-mono text-base sm:text-lg font-bold rounded-md flex items-center justify-center aspect-square shadow-md transition-all duration-150 ${currentStep === index ? 'bg-cyan-500 text-white scale-110' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                aria-label={`Go to move ${index + 1}: ${move}`}
              >
                {move}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="w-full pt-6">
        <button
          onClick={onReset}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-10 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Solve Another Cube
        </button>
      </footer>
    </div>
  );
};

export default SolutionDisplay;