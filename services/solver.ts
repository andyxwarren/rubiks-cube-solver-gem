import { CubeState, FaceName, Face } from '../types';

// Dynamically import cube-solver to avoid blocking the main thread
let cubeSolver: any = null;
let solverInitialized = false;

const initializeSolver = async () => {
  if (!solverInitialized) {
    console.log("Solver: Loading cube-solver...");
    try {
      cubeSolver = await import('cube-solver');
      console.log("Solver: Initializing solver...");
      await cubeSolver.initialize('kociemba');
      solverInitialized = true;
      console.log("Solver: Initialization complete");
    } catch (error) {
      console.error("Solver: Failed to initialize", error);
      throw new Error("Failed to initialize cube solver");
    }
  }
};

// Function to convert the app's cube state into the format expected by cube-solver
// cube-solver expects a state object with face colors
const convertCubeStateToSolverFormat = (state: CubeState): string => {
  const solverFaceOrder: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];

  const faceToString = (face: Face): string => {
    return face.flat().join('');
  }

  let cubeString = '';
  for(const faceName of solverFaceOrder) {
      const faceData = state[faceName];
      if (!faceData) {
          throw new Error(`Face ${faceName} is not scanned.`);
      }
      cubeString += faceToString(faceData);
  }

  // Remap app colors (W, Y, R, etc.) to solver colors (U, D, R, etc.) based on center pieces.
  const centerMap = {
    [state.U![1][1]]: 'U',
    [state.D![1][1]]: 'D',
    [state.F![1][1]]: 'F',
    [state.B![1][1]]: 'B',
    [state.L![1][1]]: 'L',
    [state.R![1][1]]: 'R',
  };

  return Array.from(cubeString).map(char => centerMap[char as keyof typeof centerMap] || char).join('');
};

export const solve = async (cubeState: CubeState): Promise<string[]> => {
  const numScanned = Object.keys(cubeState).length;
  if (numScanned !== 6) {
    throw new Error(`Expected 6 scanned faces, but got ${numScanned}.`);
  }

  console.log("Solver: Starting solve process...");

  // Initialize solver on first use
  await initializeSolver();

  const cubeString = convertCubeStateToSolverFormat(cubeState);
  console.log("Solver: Cube string:", cubeString);

  try {
    console.log("Solver: Calculating solution...");
    const startTime = performance.now();

    // cube-solver's solve method expects a cube state string
    const solutionString = await cubeSolver.solve(cubeString, 'kociemba');

    const endTime = performance.now();
    console.log(`Solver: Solution found in ${(endTime - startTime).toFixed(2)}ms`);
    console.log("Solver: Solution:", solutionString);

    if (!solutionString || solutionString.trim() === '') {
      // Cube is already solved
      return [];
    }

    const solutionArray = solutionString.trim().split(/\s+/);
    return solutionArray;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Solver error:", errorMessage, error);
    throw new Error(`Could not solve the cube: ${errorMessage}`);
  }
};
