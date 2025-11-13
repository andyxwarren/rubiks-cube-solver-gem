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
const SOLVED_CUBIE_PROPS: Omit<CubieState, 'id'>[] = [
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
];

const CUBIE_DATA: CubieState[] = SOLVED_CUBIE_PROPS.map((p, i) => ({...p, id: i, pos: p.pos as Vector3}));


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
        return CUBIE_DATA.map(p => ({...p}));
    }
    const cubies: CubieState[] = CUBIE_DATA.map((p) => ({ ...p, colors: {} }));

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
            const targetCubie = nextState.find(c => c.id === cubie.id);
            if (!targetCubie) continue;
            
            let shouldRotate = false;
            let newPos: Vector3 = [...cubie.pos];
            let colorMap: Partial<Record<FaceName, FaceName>> = {};

            switch(moveFace) {
                case 'U': if (y === -1) {
                    shouldRotate = true;
                    newPos = isPrime ? [-z, y, x] : [z, y, -x];
                    colorMap = isPrime ? { F: 'L', L: 'B', B: 'R', R: 'F' } : { F: 'R', R: 'B', B: 'L', L: 'F' };
                } break;
                case 'D': if (y === 1) {
                    shouldRotate = true;
                    newPos = isPrime ? [z, y, -x] : [-z, y, x];
                    colorMap = isPrime ? { F: 'R', R: 'B', B: 'L', L: 'F' } : { F: 'L', L: 'B', B: 'R', R: 'F' };
                } break;
                case 'L': if (x === -1) {
                    shouldRotate = true;
                    newPos = isPrime ? [x, z, -y] : [x, -z, y];
                    colorMap = isPrime ? { U: 'B', B: 'D', D: 'F', F: 'U' } : { U: 'F', F: 'D', D: 'B', B: 'U' };
                } break;
                case 'R': if (x === 1) {
                    shouldRotate = true;
                    newPos = isPrime ? [x, -z, y] : [x, z, -y];
                    colorMap = isPrime ? { U: 'F', F: 'D', D: 'B', B: 'U' } : { U: 'B', B: 'D', D: 'F', F: 'U' };
                } break;
                case 'F': if (z === 1) {
                    shouldRotate = true;
                    newPos = isPrime ? [y, -x, z] : [-y, x, z];
                    colorMap = isPrime ? { U: 'L', L: 'D', D: 'R', R: 'U' } : { U: 'R', R: 'D', D: 'L', L: 'U' };
                } break;
                case 'B': if (z === -1) {
                    shouldRotate = true;
                    newPos = isPrime ? [-y, x, z] : [y, -x, z];
                    colorMap = isPrime ? { U: 'R', R: 'D', D: 'L', L: 'U' } : { U: 'L', L: 'D', D: 'R', R: 'U' };
                } break;
            }

            if (shouldRotate) {
                targetCubie.pos = newPos;
                const newColors: CubieColors = {};
                for (const [faceStr, color] of Object.entries(cubie.colors)) {
                    const face = faceStr as FaceName;
                    const mappedFace = colorMap[face] || face;
                    newColors[mappedFace] = color;
                }
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
    // This revised transform logic ensures perfect centering for rotations.
    // 1. top:50%/left:50% places the cubie's top-left corner at the parent's center.
    // 2. translateX/Y(-50%) translates the cubie by half its own size, perfectly centering it.
    // 3. The remaining translates position the centered cubie within the 3x3x3 grid.
    const transform = `
        translateX(-50%) translateY(-50%)
        translateX(calc(var(--cubie-size) * ${x}))
        translateY(calc(var(--cubie-size) * ${y}))
        translateZ(calc(var(--cubie-size) * ${z}))
    `;
    
    const style = {
      transform,
      top: '50%',
      left: '50%',
    };

    return (
        <div className="cubie" style={style}>
            {Object.entries(colors).map(([face, color]) => (
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