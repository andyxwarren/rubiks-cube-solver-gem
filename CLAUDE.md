# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Rubik's Cube solver application built with Vite and TypeScript. The app allows users to scan each face of a physical Rubik's cube using their camera and provides step-by-step solution instructions using Kociemba's two-phase algorithm.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Environment Setup

The app requires a `GEMINI_API_KEY` environment variable set in `.env.local` file for Gemini AI integration (referenced in vite.config.ts, though the geminiService.ts file appears to be empty/unused currently).

## Architecture

### State Management

The app uses React's `useState` for all state management. The main application state flow:

1. **AppState enum** (types.ts:24-33) controls the UI flow through multiple screens:
   - WELCOME → CALIBRATION_START → CALIBRATING → OVERVIEW → SCANNING/EDITING → SOLVING → SOLVED

2. **CubeState** (types.ts:14-16) stores the scanned cube data as a map of FaceName → Face (3x3 color array)

3. **ColorMap** (types.ts:20-22) stores RGB values for each cube color, used for camera-based color detection

### Core Components Structure

- **App.tsx**: Main application orchestrator that manages state and renders appropriate views
- **components/Overview.tsx**: Central hub showing cube scanning progress and triggering solve
- **components/CameraView.tsx**: Camera interface for scanning cube faces with real-time color detection
- **components/CalibrationView.tsx**: Color calibration for non-standard cubes
- **components/EditFaceView.tsx**: Manual editing interface for correcting scanned colors
- **components/SolutionDisplay.tsx**: Displays solution steps with visual cube animations
- **components/CubeVisual.tsx**, **CubeStateDisplay.tsx**, **CubeNetDisplay.tsx**: Various cube visualization components

### Solver Implementation

The solver (services/solver.ts) contains:

1. **kociemba algorithm** (lines 4-288): Self-contained JavaScript implementation of Kociemba's two-phase Rubik's cube solving algorithm
   - Pre-computes pruning tables on initialization
   - Returns optimal solution strings (e.g., "U2 R' F D")

2. **convertCubeStateToString** (lines 293-320): Transforms the app's face-based CubeState into the 54-character string format expected by the solver

3. **solve function** (lines 322-338): Main export that validates all 6 faces are scanned and returns solution as string array

### Cube Notation System

The app uses standard Rubik's cube notation defined in constants.ts:

- **Face names**: F (Front/Green), U (Up/White), R (Right/Red), D (Down/Yellow), L (Left/Orange), B (Back/Blue)
- **FACE_ORDER**: ['F', 'U', 'R', 'D', 'L', 'B'] - order expected by the solver
- **FACE_CENTERS**: Maps each face name to its center color (used for validation)
- **ORIENTATION_GUIDE**: Specifies which face should be "up" when scanning each face (ensures correct orientation)

### Color Detection

- **utils/color.ts**: Contains color distance calculation using Euclidean distance in RGB space
- **ColorMap**: Maps CubeColor enum values to RGB values for matching camera input to cube colors
- Color calibration allows users to customize colors for non-standard cubes

## Key Implementation Details

1. **Face scanning flow**: CameraView captures video → extracts grid colors → matches to ColorMap → creates Face array → stored in CubeState

2. **Solution flow**: All 6 faces scanned → solve() validates and converts to string → kociemba.solve() returns move sequence → SolutionDisplay animates solution

3. **Error handling**: The solver validates cube state and throws specific errors:
   - "Twisted corner" (line 207)
   - "Flipped edge" (line 224)
   - "Parity error" (line 228)
   - Missing faces (line 304)

4. **Camera permissions**: Requested via metadata.json and uses 'environment' facing mode for rear camera

## TypeScript Configuration

- Uses ES modules (package.json type: "module")
- TypeScript 5.8.2 with React 19
- Vite handles build and hot module replacement
