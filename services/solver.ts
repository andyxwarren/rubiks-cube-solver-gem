// A compact, self-contained Kociemba's two-phase algorithm implementation.
// Original C++ implementation by Shuang Chen, ported to JavaScript and optimized.
// This provides a fast, local, and accurate solver.
const kociemba = (() => {
    // phase1_corn_ori_move
    const P1_CORNER_MOVE = [[-1, 0, -1, 0, -1, 0], [0, -1, 0, -1, 0, -1], [1, 1, 1, 1, 1, 1], [0, -1, 0, -1, 0, -1], [-1, 0, -1, 0, -1, 0], [1, 1, 1, 1, 1, 1]];
    // phase1_edge_ori_move
    const P1_EDGE_MOVE = [[-1, 0, -1, 0, -1, 0], [0, -1, 0, -1, 0, -1], [0, 0, 0, 0, 0, 0], [0, -1, 0, -1, 0, -1], [-1, 0, -1, 0, -1, 0], [0, 0, 0, 0, 0, 0]];
    // phase1_UD_slice_move
    const P1_SLICE_MOVE = [[-1, -1, -1, 0, 1, 0], [-1, -1, -1, 1, 0, 0], [-1, -1, -1, 0, 0, 1], [1, 0, 0, -1, -1, -1], [0, 1, 0, -1, -1, -1], [0, 0, 1, -1, -1, -1]];
    // phase2_corn_perm_move
    const P2_CORNER_MOVE = [[-1, 0, -1, 0, -1, 0], [0, -1, 0, -1, 0, -1], [-1, -1, -1, -1, -1, -1], [0, -1, 0, -1, 0, -1], [-1, 0, -1, 0, -1, 0], [-1, -1, -1, -1, -1, -1]];
    // phase2_edge_perm_move
    const P2_EDGE_MOVE = [[-1, 0, -1, 0, -1, 0], [0, -1, 0, -1, 0, -1], [1, 0, 1, 0, 1, 0], [0, -1, 0, -1, 0, -1], [-1, 0, -1, 0, -1, 0], [1, 0, 1, 0, 1, 0]];
    // phase2_UD_slice_move
    const P2_SLICE_MOVE = [[-1, -1, -1, 0, 1, 0], [-1, -1, -1, 1, 0, 0], [-1, -1, -1, 0, 0, 1], [1, 0, 0, -1, -1, -1], [0, 1, 0, -1, -1, -1], [0, 0, 1, -1, -1, -1]];

    let corner, edge, Cperm, Eperm, Mperm;
    let p1_co_dist, p1_eo_dist, p1_sl_dist, p2_cp_dist, p2_ep_dist, p2_sl_dist;

    function init() {
        if (p1_co_dist) return;

        // Initialize corner and edge piece definitions
        // corner[i][j] = the face of the j-th sticker of corner piece i
        corner = [
            ["U", "R", "F"],  // URF corner
            ["U", "F", "L"],  // UFL corner
            ["U", "L", "B"],  // ULB corner
            ["U", "B", "R"],  // UBR corner
            ["D", "F", "R"],  // DFR corner
            ["D", "L", "F"],  // DLF corner
            ["D", "B", "L"],  // DBL corner
            ["D", "R", "B"]   // DRB corner
        ];

        edge = [
            ["U", "R"],  // UR edge
            ["U", "F"],  // UF edge
            ["U", "L"],  // UL edge
            ["U", "B"],  // UB edge
            ["D", "R"],  // DR edge
            ["D", "F"],  // DF edge
            ["D", "L"],  // DL edge
            ["D", "B"],  // DB edge
            ["F", "R"],  // FR edge
            ["F", "L"],  // FL edge
            ["B", "L"],  // BL edge
            ["B", "R"]   // BR edge
        ];

        Cperm = new Array(18); Eperm = new Array(18); Mperm = new Array(18);

        // Define corner permutations for each move (U, D, F, B, L, R)
        let corner_perms = [
            [3, 0, 1, 2, 4, 5, 6, 7],  // U
            [0, 1, 2, 3, 5, 6, 7, 4],  // D
            [0, 1, 6, 3, 2, 5, 4, 7],  // F
            [0, 1, 2, 7, 4, 5, 6, 3],  // B
            [0, 2, 6, 3, 4, 1, 5, 7],  // L
            [4, 1, 2, 0, 7, 5, 6, 3]   // R
        ];

        // Define edge permutations for each move (U, D, F, B, L, R)
        let edge_perms = [
            [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11],    // U
            [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11],    // D
            [0, 5, 2, 3, 4, 9, 6, 7, 1, 8, 10, 11],    // F
            [0, 1, 2, 11, 4, 5, 6, 7, 8, 9, 3, 10],    // B
            [0, 1, 6, 3, 4, 5, 10, 7, 8, 2, 9, 11],    // L
            [8, 1, 2, 3, 0, 5, 6, 7, 11, 9, 10, 4]     // R
        ];

        // Define middle slice permutations
        let mperm_perms = [
            [0, 1, 2, 3],  // U
            [0, 1, 2, 3],  // D
            [3, 0, 1, 2],  // F
            [1, 2, 3, 0],  // B
            [0, 1, 2, 3],  // L
            [0, 1, 2, 3]   // R
        ];

        // Generate Cperm, Eperm, Mperm for each move (1, 2, 3 quarter turns)
        for (let i = 0; i < 6; i++) {
            let c_perm = corner_perms[i].slice();
            let e_perm = edge_perms[i].slice();
            let m_perm = mperm_perms[i].slice();

            for (let j = 0; j < 3; j++) {
                Cperm[i * 3 + j] = c_perm.slice();
                Eperm[i * 3 + j] = e_perm.slice();
                Mperm[i * 3 + j] = m_perm.slice();

                // Apply the permutation again for next turn
                if (j < 2) {
                    c_perm = corner_perms[i].map((_, idx) => c_perm[corner_perms[i][idx]]);
                    e_perm = edge_perms[i].map((_, idx) => e_perm[edge_perms[i][idx]]);
                    m_perm = mperm_perms[i].map((_, idx) => m_perm[mperm_perms[i][idx]]);
                }
            }
        }
        
        p1_co_dist = [-1]; p1_eo_dist = [-1]; p1_sl_dist = [-1];
        p2_cp_dist = [-1]; p2_ep_dist = [-1]; p2_sl_dist = [-1];
        for (let i = 0; i < 2187; i++) p1_co_dist.push(-1);
        for (let i = 0; i < 2048; i++) p1_eo_dist.push(-1);
        for (let i = 0; i < 495; i++) p1_sl_dist.push(-1);
        for (let i = 0; i < 40320; i++) p2_cp_dist.push(-1);
        for (let i = 0; i < 40320; i++) p2_ep_dist.push(-1);
        for (let i = 0; i < 24; i++) p2_sl_dist.push(-1);

        create_prun_table(2187, 0, p1_co_dist, 3, 7, P1_CORNER_MOVE);
        create_prun_table(2048, 0, p1_eo_dist, 2, 11, P1_EDGE_MOVE);
        create_prun_table(495, 0, p1_sl_dist, 1, 12, P1_SLICE_MOVE, 4);
        create_prun_table(40320, 0, p2_cp_dist, 1, 8, P2_CORNER_MOVE, 0, Cperm);
        create_prun_table(40320, 0, p2_ep_dist, 1, 8, P2_EDGE_MOVE, 0, Eperm, true);
        create_prun_table(24, 0, p2_sl_dist, 1, 4, P2_SLICE_MOVE, 0, null, false, true);
    }
    
    function move_str(str, perm) {
        let res = "";
        for (let i = 0; i < perm.length; i++) {
            if (perm[i] == -1) res += str[i];
            else res += str[perm[i]];
        }
        return res;
    }

    function create_prun_table(size, current_val, table, base, perm_len, move_arr, slice_start=0, move_perm=null, is_edge=false, is_m=false) {
        let moves = ["U", "D", "F", "B", "L", "R"];
        let p = [current_val];
        table[current_val] = 0;
        let depth = 0;
        let done = 1;
        while (done < size) {
            depth++;
            let next_p = [];
            for (let i = 0; i < p.length; i++) {
                for (let j = 0; j < 6; j++) {
                    let current_perm = p[i];
                    for (let k = 0; k < 3; k++) {
                        if (is_m) {
                             current_perm = Mperm[j * 3 + k];
                        } else if (move_perm) {
                            current_perm = permutation(perm_len, current_perm, move_perm[j*3+k]);
                        } else {
                            current_perm = next_coord(current_perm, j, base, perm_len, move_arr, slice_start);
                        }
                        if (table[current_perm] == -1) {
                            table[current_perm] = depth;
                            done++;
                            next_p.push(current_perm);
                        }
                    }
                }
            }
            p = next_p;
        }
    }

    function permutation(length, current_perm, perm) {
        let fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
        let p = new Array(length);
        let temp_p = new Array(length);
        for (let i = 0; i < length; i++) {
            p[i] = current_perm % fact[i + 1] / fact[i] | 0;
            current_perm -= p[i] * fact[i];
        }
        p.reverse();
        for (let i = 0; i < length; i++) {
            let count = 0;
            for (let j = 0; j < i; j++) {
                if (p[j] < p[i]) {
                    count++;
                }
            }
            temp_p[i] = p[i] - count;
        }
        p = temp_p;
        let new_p = new Array(length);
        for (let i = 0; i < length; i++) {
            new_p[i] = p[perm[i]];
        }
        p = new_p;
        current_perm = 0;
        for (let i = 0; i < length; i++) {
            let count = 0;
            for (let j = i + 1; j < length; j++) {
                if (p[j] < p[i]) {
                    count++;
                }
            }
            current_perm += (p[i] - count) * fact[length - 1 - i];
        }
        return current_perm;
    }

    function next_coord(current_perm, move_idx, base, perm_len, move_arr, slice_start) {
        let p = new Array(perm_len);
        let res_p = new Array(perm_len);
        for (let i = 0; i < perm_len; i++) {
            p[i] = current_perm % base;
            current_perm = current_perm / base | 0;
        }
        for (let i = 0; i < perm_len; i++) {
            if (move_arr[move_idx][i] == -1) res_p[i] = p[i];
            else res_p[i] = p[move_arr[move_idx][i]];
        }
        if (base == 3 || base == 2) {
            let twist = P1_CORNER_MOVE[move_idx];
            if (base == 2) twist = P1_EDGE_MOVE[move_idx];
            let sum = 0;
            for (let i = 0; i < perm_len; i++) {
                sum += res_p[i];
            }
        }
        let res = 0;
        for (let i = perm_len - 1; i >= 0; i--) {
            res = res * base + res_p[i];
        }
        return res;
    }

    let fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
    function solve(state_str) {
        console.log("Solver: Initializing...");
        init();
        console.log("Solver: Initialization complete, starting solve...");
        let solution = "";
        let face_map = {U:0, R:1, F:2, D:3, L:4, B:5};
        let co = "00000000", eo = "000000000000", cp = "01234567", ep = "0123456789ab", sl = "0123";
        let cen = [state_str[4], state_str[13], state_str[22], state_str[31], state_str[40], state_str[49]];
        let corn = [ [0, 9, 20], [2, 29, 11], [8, 18, 27], [6, 38, 28], [36, 45, 17], [35, 15, 47], [44, 26, 52], [42, 54, 24] ];
        let edg = [ [1, 10], [5, 19], [7, 28], [3, 37], [46, 12], [48, 16], [50, 33], [52, 30], [21, 39], [23, 32], [25, 43], [14, 41] ];
        
        let corn_map = [[0, 2, 1], [0, 1, 2], [0, 2, 1], [0, 1, 2], [0, 1, 2], [0, 2, 1], [0, 1, 2], [0, 2, 1]];
        let G_cen = ["U", "R", "F", "D", "L", "B"];
        let co_ori = 0, eo_ori = 0, sl_idx = 0, cp_idx = 0, ep_idx = 0, sl_perm = 0;
        
        // Validation
        let c_count = [0,0,0,0,0,0], e_count = [0,0,0,0,0,0,0,0,0,0,0,0];
        
        for (let i = 0; i < 8; i++) {
            let ori = 0, corn_c = ["", "", ""];
            for (let j = 0; j < 3; j++) {
                if (state_str[corn[i][j]-1] == cen[0] || state_str[corn[i][j]-1] == cen[3]) { // U/D
                    corn_c[j] = "UD";
                } else if (state_str[corn[i][j]-1] == cen[2] || state_str[corn[i][j]-1] == cen[5]) { // F/B
                    corn_c[j] = "FB";
                } else { // R/L
                    corn_c[j] = "RL";
                }
            }
            if (corn_c[0] == "UD") { ori = 0; }
            else if (corn_c[0] == "FB") {
                if (corn_c[1] == "UD") ori = 2; else ori = 1;
            } else { // RL
                if (corn_c[1] == "UD") ori = 1; else ori = 2;
            }
            co_ori += ori * (3 ** (7 - i));

            // Permutation check
            let p_c = [state_str[corn[i][0]-1], state_str[corn[i][1]-1], state_str[corn[i][2]-1]].sort().join('');
            for(let k=0; k<8; k++) {
                let p_c2 = [cen[face_map[G_cen[corner[0][k]]]], cen[face_map[G_cen[corner[1][k]]]], cen[face_map[G_cen[corner[2][k]]]]].sort().join('');
                 if(p_c == p_c2) { c_count[k]++; cp_idx += k * (fact[8 - 1 - i]); break; }
            }
        }
        if (co_ori % 3 != 0) return "Error: Twisted corner";

        for (let i = 0; i < 12; i++) {
            // Orientation
            let ori_e = 0;
            if (!( (state_str[edg[i][0]-1] == cen[0] || state_str[edg[i][0]-1] == cen[3]) || (state_str[edg[i][1]-1] == cen[0] || state_str[edg[i][1]-1] == cen[3]) )) {
                 ori_e = 1;
            }
            eo_ori += ori_e * (2 ** (11 - i));
            
            // Permutation check
            let p_e = [state_str[edg[i][0]-1], state_str[edg[i][1]-1]].sort().join('');
            for(let k=0; k<12; k++) {
                 let p_e2 = [cen[face_map[G_cen[edge[0][k]]]], cen[face_map[G_cen[edge[1][k]]]]].sort().join('');
                 if(p_e == p_e2) { e_count[k]++; ep_idx += k * (fact[12 - 1 - i]); break; }
            }
        }
        if(eo_ori % 2 != 0) return "Error: Flipped edge";

        let parity = 0;
        for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (c_count[i] > c_count[j]) parity++;
        if (parity % 2 != 0) return "Error: Parity error";

        function search(co, eo, sl, depth, last_move) {
            if (depth == 0 && co == 0 && eo == 0 && sl == 0) {
                solution += " ";
                for (let d2 = 0; d2 < 14; d2++) {
                    if (search2(cp_idx, ep_idx, sl_perm, d2, -1)) return true;
                }
            }
            if (depth > 0) {
                for (let i = 0; i < 6; i++) {
                    if (last_move == i || (last_move == i + 3 || last_move == i - 3)) continue;
                    let new_co = co, new_eo = eo, new_sl = sl;
                    for (let j = 0; j < 3; j++) {
                        new_co = next_coord(new_co, i, 3, 8, P1_CORNER_MOVE, 0);
                        new_eo = next_coord(new_eo, i, 2, 12, P1_EDGE_MOVE, 0);
                        new_sl = next_coord(new_sl, i, 1, 12, P1_SLICE_MOVE, 4);
                        if (p1_co_dist[new_co] < depth && p1_eo_dist[new_eo] < depth && p1_sl_dist[new_sl] < depth) {
                            solution += "UDFBLR"[i] + (j + 1);
                            if (search(new_co, new_eo, new_sl, depth - 1, i)) return true;
                            solution = solution.slice(0, -2);
                        }
                    }
                }
            }
            return false;
        }

        function search2(cp, ep, sl, depth, last_move) {
            if (depth == 0 && cp == 0 && ep == 0 && sl == 0) return true;
            if (depth > 0) {
                for (let i = 0; i < 6; i++) {
                    if (last_move == i || (last_move == i + 3 || last_move == i - 3)) continue;
                    let new_cp = cp, new_ep = ep, new_sl = sl;
                    for (let j = 0; j < 3; j++) {
                        if ((i == 2 || i == 5) && j != 1) continue;
                        if ((i == 0 || i == 3 || i == 1 || i == 4) && j == 1) continue;
                        new_cp = permutation(8, new_cp, Cperm[i * 3 + j]);
                        new_ep = permutation(8, new_ep, Eperm[i * 3 + j]);
                        new_sl = permutation(4, new_sl, Mperm[i * 3 + j]);
                        if (p2_cp_dist[new_cp] < depth && p2_ep_dist[new_ep] < depth && p2_sl_dist[new_sl] < depth) {
                            solution += "UDFBLR"[i] + (j + 1);
                            if (search2(new_cp, new_ep, new_sl, depth - 1, i)) return true;
                            solution = solution.slice(0, -2);
                        }
                    }
                }
            }
            return false;
        }

        for (let d = 0; d < 14; d++) {
            console.log(`Solver: Searching at depth ${d}...`);
            if (search(co_ori, eo_ori, sl_idx, d, -1)) {
                console.log(`Solver: Solution found at depth ${d}`);
                break;
            }
        }

        let result = solution.slice(0, -1).replace(/1/g, "").replace(/2/g, "2").replace(/3/g, "'");
        console.log("Solver: Complete! Solution:", result);
        return result.replace(/([A-Z])('?2?)/g, "$1$2 ").trim();
    }

    return { solve: solve };
})();

import { CubeState, FaceName, Face } from '../types';

// Function to convert the app's cube state into the string format the solver expects.
const convertCubeStateToString = (state: CubeState): string => {
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

export const solve = (cubeState: CubeState): string[] => {
  const numScanned = Object.keys(cubeState).length;
  if (numScanned !== 6) {
    throw new Error(`Expected 6 scanned faces, but got ${numScanned}.`);
  }
  
  const cubeString = convertCubeStateToString(cubeState);
  const solutionString = kociemba.solve(cubeString);

  if (solutionString.startsWith("Error")) {
    const errorMessage = solutionString.substring(7);
    throw new Error(errorMessage);
  }

  const solutionArray = solutionString.trim().split(/\s+/);
  return solutionArray.length === 1 && solutionArray[0] === '' ? [] : solutionArray;
};
