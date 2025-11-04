import React, { useState, useEffect, useMemo } from 'react';
import { CubeColor, CubeState, FaceName } from '../types';
import { COLOR_CLASSES } from '../constants';

// --- Types ---
type Vector3 = [number, number, number]; // [x, y, z]
type CubieColors = Partial<Record<FaceName, CubeColor>>;
interface CubieState {
  id: number;
  pos: Vector3;
  colors: CubieColors;
}

// --- Constants ---
// Fix: Correct type annotation for SOLVED_CUBIE_PROPS. The .map call adds the 'id' property, making it a CubieState[].
const SOLVED_CUBIE_PROPS: CubieState[] = [
    // Up face (y=-1)
    { pos: [-1, -1, -1], colors: { U: CubeColor.WHITE, L: CubeColor.ORANGE, B: CubeColor.BLUE } },
    { pos: [ 0, -1, -1], colors: { U: CubeColor.WHITE, B: CubeColor.BLUE } },
    { pos: [ 1, -1, -1], colors: { U: CubeColor.WHITE, R: CubeColor.RED,    B: CubeColor.BLUE } },
    { pos: [-1, -1,  0], colors: { U: CubeColor.WHITE, L: CubeColor.ORANGE } },
    { pos: [ 0, -1,  0], colors: { U: CubeColor.WHITE } },
    { pos: [ 1, -1,  0], colors: { U: CubeColor.WHITE, R: CubeColor.RED } },
    { pos: [-1, -1,  1], colors: { U: CubeColor.WHITE, L: CubeColor.ORANGE, F: CubeColor.GREEN } },
    { pos: [ 0, -1,  1], colors: { U: CubeColor.WHITE, F: CubeColor.GREEN } },
    { pos: [ 1, -1,  1], colors: { U: CubeColor.WHITE, R: CubeColor.RED,    F: CubeColor.GREEN } },
    // Middle layer (y=0)
    { pos: [-1, 0, -1], colors: { L: CubeColor.ORANGE, B: CubeColor.BLUE } },
    { pos: [ 0, 0, -1], colors: { B: CubeColor.BLUE } },
    { pos: [ 1, 0, -1], colors: { R: CubeColor.RED,    B: CubeColor.BLUE } },
    { pos: [-1, 0,  0], colors: { L: CubeColor.ORANGE } },
    { pos: [ 1, 0,  0], colors: { R: CubeColor.RED } },
    { pos: [-1, 0,  1], colors: { L: CubeColor.ORANGE, F: CubeColor.GREEN } },
    { pos: [ 0, 0,  1], colors: { F: CubeColor.GREEN } },
    { pos: [ 1, 0,  1], colors: { R: CubeColor.RED,    F: CubeColor.GREEN } },
    // Down face (y=1)
    { pos: [-1, 1, -1], colors: { D: CubeColor.YELLOW, L: CubeColor.ORANGE, B: CubeColor.BLUE } },
    { pos: [ 0, 1, -1], colors: { D: CubeColor.YELLOW, B: CubeColor.BLUE } },
    { pos: [ 1, 1, -1], colors: { D: CubeColor.YELLOW, R: CubeColor.RED,    B: CubeColor.BLUE } },
    { pos: [-1, 1,  0], colors: { D: CubeColor.YELLOW, L: CubeColor.ORANGE } },
    { pos: [ 0, 1,  0], colors: { D: CubeColor.YELLOW } },
    { pos: [ 1, 1,  0], colors: { D: CubeColor.YELLOW, R: CubeColor.RED } },
    { pos: [-1, 1,  1], colors: { D: CubeColor.YELLOW, L: CubeColor.ORANGE, F: CubeColor.GREEN } },
    { pos: [ 0, 1,  1], colors: { D: CubeColor.YELLOW, F: CubeColor.GREEN } },
    { pos: [ 1, 1,  1], colors: { D: CubeColor.YELLOW, R: CubeColor.RED,    F: CubeColor.GREEN } },
].map((p, i) => ({...p, id: i, pos: p.pos as Vector3}));


const stickerMap: Record<FaceName, { pos: Vector3; face: FaceName }[][]> = {
    U: [
        [{ pos: [-1,-1,-1], face: 'U' }, { pos: [0,-1,-1], face: 'U' }, { pos: [1,-1,-1], face: 'U' }],
        [{ pos: [-1,-1, 0], face: 'U' }, { pos: [0,-1, 0], face: 'U' }, { pos: [1,-1, 0], face: 'U' }],
        [{ pos: [-1,-1, 1], face: 'U' }, { pos: [0,-1, 1], face: 'U' }, { pos: [1,-1, 1], face: 'U' }],
    ],
    L: [
        [{ pos: [-1,-1,-1], face: 'L' }, { pos: [-1,-1,0], face: 'L' }, { pos: [-1,-1,1], face: 'L' }],
        [{ pos: [-1, 0,-1], face: 'L' }, { pos: [-1, 0,0], face: 'L' }, { pos: [-1, 0,1], face: 'L' }],
        [{ pos: [-1, 1,-1], face: 'L' }, { pos: [-1, 1,0], face: 'L' }, { pos: [-1, 1,1], face: 'L' }],
    ],
    F: [
        [{ pos: [-1,-1,1], face: 'F' }, { pos: [0,-1,1], face: 'F' }, { pos: [1,-1,1], face: 'F' }],
        [{ pos: [-1, 0,1], face: 'F' }, { pos: [0, 0,1], face: 'F' }, { pos: [1, 0,1], face: 'F' }],
        [{ pos: [-1, 1,1], face: 'F' }, { pos: [0, 1,1], face: 'F' }, { pos: [1, 1,1], face: 'F' }],
    ],
    R: [
        [{ pos: [1,-1,1], face: 'R' }, { pos: [1,-1,0], face: 'R' }, { pos: [1,-1,-1], face: 'R' }],
        [{ pos: [1, 0,1], face: 'R' }, { pos: [1, 0,0], face: 'R' }, { pos: [1, 0,-1], face: 'R' }],
        [{ pos: [1, 1,1], face: 'R' }, { pos: [1, 1,0], face: 'R' }, { pos: [1, 1,-1], face: 'R' }],
    ],
    B: [
        [{ pos: [1,-1,-1], face: 'B' }, { pos: [0,-1,-1], face: 'B' }, { pos: [-1,-1,-1], face: 'B' }],
        [{ pos: [1, 0,-1], face: 'B' }, { pos: [0, 0,-1], face: 'B' }, { pos: [-1, 0,-1], face: 'B' }],
        [{ pos: [1, 1,-1], face: 'B' }, { pos: [0, 1,-1], face: 'B' }, { pos: [-1, 1,-1], face: 'B' }],
    ],
    D: [
        [{ pos: [-1,1,1], face: 'D' }, { pos: [0,1,1], face: 'D' }, { pos: [1,1,1], face: 'D' }],
        [{ pos: [-1,1,0], face: 'D' }, { pos: [0,1,0], face: 'D' }, { pos: [1,1,0], face: 'D' }],
        [{ pos: [-1,1,-1], face: 'D' }, { pos: [0,1,-1], face: 'D' }, { pos: [1,1,-1], face: 'D' }],
    ]
};

const mapScannedStateToCubies = (scannedState: CubeState): CubieState[] => {
    if (Object.keys(scannedState).length < 6) {
        return SOLVED_CUBIE_PROPS.map(p => ({...p}));
    }
    const cubies: CubieState[] = SOLVED_CUBIE_PROPS.map((p) => ({ ...p, colors: {} }));

    for (const faceName of (Object.keys(stickerMap) as FaceName[])) {
        const scannedFace = scannedState[faceName];
        if (!scannedFace) continue;

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const { pos, face } = stickerMap[faceName][r][c];
                const cubie = cubies.find(cb => cb.pos[0] === pos[0] && cb.pos[1] === pos[1] && cb.pos[2] === pos[2]);
                if (cubie) {
                    cubie.colors[face] = scannedFace[r][c];
                }
            }
        }
    }
    return cubies;
};

const applyMove = (cubies: CubieState[], move: string): CubieState[] => {
    const moveFace = move[0] as FaceName;
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const turns = isDouble ? 2 : 1;
    
    let currentCubiesState = cubies.map(c => ({...c}));

    for (let i = 0; i < turns; i++) {
        const nextState = JSON.parse(JSON.stringify(currentCubiesState));
        for (const cubie of currentCubiesState) {
            const [x, y, z] = cubie.pos;
            const colors = cubie.colors;
            const targetCubie = nextState.find(c => c.id === cubie.id);
            if (!targetCubie) continue;

            if (moveFace === 'U' && y === -1) {
                targetCubie.pos = isPrime ? [z, y, -x] : [-z, y, x];
                const newColors: CubieColors = { ...colors, U: colors.U, D: colors.D };
                if (isPrime) { newColors.F = colors.L; newColors.L = colors.B; newColors.B = colors.R; newColors.R = colors.F; } 
                else { newColors.F = colors.R; newColors.R = colors.B; newColors.B = colors.L; newColors.L = colors.F; }
                targetCubie.colors = newColors;
            } else if (moveFace === 'D' && y === 1) {
                targetCubie.pos = isPrime ? [-z, y, x] : [z, y, -x];
                const newColors: CubieColors = { ...colors, U: colors.U, D: colors.D };
                if (isPrime) { newColors.F = colors.R; newColors.R = colors.B; newColors.B = colors.L; newColors.L = colors.F; }
                else { newColors.F = colors.L; newColors.L = colors.B; newColors.B = colors.R; newColors.R = colors.F; }
                targetCubie.colors = newColors;
            } else if (moveFace === 'L' && x === -1) {
                targetCubie.pos = isPrime ? [x, -z, y] : [x, z, -y];
                const newColors: CubieColors = { ...colors, L: colors.L, R: colors.R };
                if (isPrime) { newColors.U = colors.F; newColors.F = colors.D; newColors.D = colors.B; newColors.B = colors.U; }
                else { newColors.U = colors.B; newColors.B = colors.D; newColors.D = colors.F; newColors.F = colors.U; }
                targetCubie.colors = newColors;
            } else if (moveFace === 'R' && x === 1) {
                targetCubie.pos = isPrime ? [x, z, -y] : [x, -z, y];
                const newColors: CubieColors = { ...colors, L: colors.L, R: colors.R };
                if (isPrime) { newColors.U = colors.B; newColors.B = colors.D; newColors.D = colors.F; newColors.F = colors.U; }
                else { newColors.U = colors.F; newColors.F = colors.D; newColors.D = colors.B; newColors.B = colors.U; }
                targetCubie.colors = newColors;
            } else if (moveFace === 'F' && z === 1) {
                targetCubie.pos = isPrime ? [-y, x, z] : [y, -x, z];
                const newColors: CubieColors = { ...colors, F: colors.F, B: colors.B };
                if (isPrime) { newColors.U = colors.L; newColors.L = colors.D; newColors.D = colors.R; newColors.R = colors.U; }
                else { newColors.U = colors.R; newColors.R = colors.D; newColors.D = colors.L; newColors.L = colors.U; }
                targetCubie.colors = newColors;
            } else if (moveFace === 'B' && z === -1) {
                targetCubie.pos = isPrime ? [y, -x, z] : [-y, x, z];
                const newColors: CubieColors = { ...colors, F: colors.F, B: colors.B };
                if (isPrime) { newColors.U = colors.R; newColors.R = colors.D; newColors.D = colors.L; newColors.L = colors.U; }
                else { newColors.U = colors.L; newColors.L = colors.D; newColors.D = colors.R; newColors.R = colors.U; }
                targetCubie.colors = newColors;
            }
        }
        currentCubiesState = nextState;
    }
    return currentCubiesState;
};

const calculateStateAtStep = (initialCubies: CubieState[], solution: string[], step: number): CubieState[] => {
    let cubies = initialCubies;
    for (let i = 0; i <= step; i++) {
        if (solution[i]) {
            cubies = applyMove(cubies, solution[i]);
        }
    }
    return cubies;
};

interface CubieProps extends CubieState {}

const Cubie: React.FC<CubieProps> = React.memo(({ pos, colors }) => {
    const [x, y, z] = pos;
    const transform = `
        translateX(calc(var(--cubie-size) * ${x}))
        translateY(calc(var(--cubie-size) * ${y}))
        translateZ(calc(var(--cubie-size) * ${z}))
    `;
    return (
        <div className="cubie" style={{ transform }}>
            {Object.entries(colors).map(([face, color]) => (
                // Fix: Add type assertion to 'color' because TypeScript infers it as 'unknown' from Object.entries.
                <div key={face} className={`cubie-face cubie-face-${face} ${COLOR_CLASSES[color as CubeColor]}`} />
            ))}
        </div>
    );
});

interface AnimatedCubeProps {
  initialState: CubeState;
  solution: string[];
  currentStep: number;
  rotation: { x: number; y: number };
}

const AnimatedCube: React.FC<AnimatedCubeProps> = ({ initialState, solution, currentStep, rotation }) => {
    const initialCubies = useMemo(() => mapScannedStateToCubies(initialState), [initialState]);
    
    const [displayedCubies, setDisplayedCubies] = useState<CubieState[]>(initialCubies);
    const [animationState, setAnimationState] = useState<{ move: string; layerIds: number[] } | null>(null);

    useEffect(() => {
        const move = solution[currentStep];
        const prevState = calculateStateAtStep(initialCubies, solution, currentStep - 1);
        
        if (currentStep < 0) {
            setDisplayedCubies(initialCubies);
            setAnimationState(null);
            return;
        }

        if (!move) {
            const finalState = calculateStateAtStep(initialCubies, solution, currentStep);
            setDisplayedCubies(finalState);
            setAnimationState(null);
            return;
        }

        setDisplayedCubies(prevState);

        const moveFace = move[0];
        const layerIds = prevState.filter(c => {
            if (moveFace === 'U') return c.pos[1] === -1;
            if (moveFace === 'D') return c.pos[1] === 1;
            if (moveFace === 'L') return c.pos[0] === -1;
            if (moveFace === 'R') return c.pos[0] === 1;
            if (moveFace === 'F') return c.pos[2] === 1;
            if (moveFace === 'B') return c.pos[2] === -1;
            return false;
        }).map(c => c.id);

        setAnimationState({ move, layerIds });
        
        const timer = setTimeout(() => {
            const targetState = calculateStateAtStep(initialCubies, solution, currentStep);
            setDisplayedCubies(targetState);
            setAnimationState(null);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentStep, solution, initialCubies]);

    const animatedCubieIds = animationState ? new Set(animationState.layerIds) : new Set();
    const staticCubies = displayedCubies.filter(c => !animatedCubieIds.has(c.id));
    const animatedCubies = displayedCubies.filter(c => animatedCubieIds.has(c.id));

    let animClass = '';
    if (animationState) {
        let move = animationState.move;
        if (move.includes("'")) {
            move = move.replace("'", "-prime");
        }
        animClass = `anim-${move}`;
    }

    return (
        <div className="scene">
            <div className="cube" style={{ transform: `translateZ(calc(var(--cube-size) * -1)) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
                <div className="cubie" style={{ transform: 'translateZ(0)' }}></div> {/* Center piece */}
                
                {staticCubies.map(cubie => <Cubie key={cubie.id} {...cubie} />)}

                {animationState && (
                    <div className={`cube-layer ${animClass}`}>
                        {animatedCubies.map(cubie => <Cubie key={cubie.id} {...cubie} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimatedCube;