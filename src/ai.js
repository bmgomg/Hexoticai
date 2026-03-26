// ---------------------------------------------------------------------------
// ai.js
// ---------------------------------------------------------------------------

const ADJ = [
    { dr: -2, dc: 0 }, // 0 top
    { dr: -1, dc: +1 }, // 1 top-right
    { dr: +1, dc: +1 }, // 2 bottom-right
    { dr: +2, dc: 0 }, // 3 bottom
    { dr: +1, dc: -1 }, // 4 bottom-left
    { dr: -1, dc: -1 }, // 5 top-left
];

const WIN_DIRS = [
    { dr: -1, dc: -1 }, // nw
    { dr: -2, dc: 0 }, // n
    { dr: -1, dc: +1 }, // ne
];

const norm = (bits, turns) => {
    if (!turns) return bits;
    const t = ((turns % 6) + 6) % 6;
    const b = [...bits, ...bits, ...bits];
    return b.slice(6 - t, 12 - t);
};

const buildMap = (placedTiles) => {
    const map = {};
    for (const t of placedTiles) {
        map[`${t.place.row}/${t.place.col}`] = t;
    }
    return map;
};

const getPlaced = (tiles) => tiles.filter(t => t.place?.row);
const getTile = (map, row, col) => map[`${row}/${col}`] || null;

// ─── Legal move helpers ──────────────────────────────────────────────────────

const colorMatchOk = (map, tile, row, col, turns) => {
    const bits = norm(tile.bits, turns);
    for (let i = 0; i < 6; i++) {
        const { dr, dc } = ADJ[i];
        const adj = getTile(map, row + dr, col + dc);
        if (!adj || adj === tile) continue;
        const abits = norm(adj.bits, adj.turns || 0);
        const j = i < 3 ? i + 3 : i - 3;
        if (bits[i] && abits[j] !== bits[i]) return false;
    }
    return true;
};

const neighborCount = (map, tile, row, col) => {
    let count = 0;
    for (const { dr, dc } of ADJ) {
        const adj = getTile(map, row + dr, col + dc);
        if (adj && adj !== tile) count++;
    }
    return count;
};

const isContiguous = (placed, movedTile, newRow, newCol) => {
    const nodes = placed.map(t =>
        t === movedTile
            ? { ...t, place: { row: newRow, col: newCol } }
            : t
    );
    const visited = new Set();
    const key = (t) => `${t.place.row}/${t.place.col}`;
    const map = {};
    for (const n of nodes) map[key(n)] = n;
    const start = nodes.find(t => t === movedTile) || nodes[0];
    const stack = [start];
    while (stack.length) {
        const cur = stack.pop();
        const k = key(cur);
        if (visited.has(k)) continue;
        visited.add(k);
        for (const { dr, dc } of ADJ) {
            const nk = `${cur.place.row + dr}/${cur.place.col + dc}`;
            if (map[nk] && !visited.has(nk)) stack.push(map[nk]);
        }
    }
    return visited.size === nodes.length;
};

const candidatePositions = (map, placed) => {
    const occupied = new Set(placed.map(t => `${t.place.row}/${t.place.col}`));
    const candidates = new Set();
    for (const t of placed) {
        for (const { dr, dc } of ADJ) {
            const r = t.place.row + dr;
            const c = t.place.col + dc;
            const k = `${r}/${c}`;
            if (!occupied.has(k)) candidates.add(k);
        }
    }
    return [...candidates].map(k => {
        const [r, c] = k.split('/').map(Number);
        return { row: r, col: c };
    });
};

const legalRotations = (tile, map, row, col, excludeTile = null) => {
    const seen = new Set();
    const results = [];
    for (let turns = 0; turns < 6; turns++) {
        const key = norm(tile.bits, turns).join('');
        if (seen.has(key)) continue;
        seen.add(key);
        if (colorMatchOk(map, excludeTile || tile, row, col, turns)) {
            results.push(turns);
        }
    }
    return results;
};

// ─── Board evaluation ────────────────────────────────────────────────────────

const N_TO_WIN = 5;

const analyseLines = (map, placed, player, minLen) => {
    const myTiles = placed.filter(t => t.player === player);
    const results = [];

    for (const anchor of myTiles) {
        const { row, col } = anchor.place;
        for (const { dr, dc } of WIN_DIRS) {
            const prev = getTile(map, row - dr, col - dc);
            if (prev?.player === player) continue;

            let len = 0;
            while (true) {
                const t = getTile(map, row + dr * len, col + dc * len);
                if (t?.player === player) len++; else break;
            }

            if (len < minLen) continue;

            const beforeStart = getTile(map, row - dr, col - dc);
            const afterEnd = getTile(map, row + dr * len, col + dc * len);
            const openEnds = (beforeStart === null ? 1 : 0) + (afterEnd === null ? 1 : 0);

            results.push({ len, openEnds });
        }
    }
    return results;
};

const evaluateBoard = (map, placed, aiPlayer) => {
    const opponent = aiPlayer === 1 ? 2 : 1;

    const aiLines = analyseLines(map, placed, aiPlayer, 1);
    const oppLines = analyseLines(map, placed, opponent, 1);

    if (aiLines.some(l => l.len >= N_TO_WIN)) return 100000;
    if (oppLines.some(l => l.len >= N_TO_WIN)) return -100000;

    let score = 0;

    for (const { len, openEnds } of aiLines) {
        if (openEnds === 0) continue;
        const base = len === 4 ? 2000 : len === 3 ? 300 : len === 2 ? 50 : 5;
        score += base * openEnds;
    }

    for (const { len, openEnds } of oppLines) {
        if (openEnds === 0) continue;
        const base = len === 4 ? 5000 : len === 3 ? 800 : len === 2 ? 80 : 5;
        const multiplier = openEnds === 2 ? 3 : 1;
        score -= base * multiplier;
    }

    return score;
};

// ─── Reposition helper ───────────────────────────────────────────────────────

const tryReposition = (repoTile, placed, currentMap) => {
    const oldRow = repoTile.place.row;
    const oldCol = repoTile.place.col;
    const oldNeighborCount = neighborCount(currentMap, repoTile, oldRow, oldCol);

    const mapWithout = buildMap(placed.filter(t => t !== repoTile));
    const placedWithout = placed.filter(t => t !== repoTile);
    const repoPositions = candidatePositions(mapWithout, placedWithout);

    const results = [];

    for (const { row: rRow, col: rCol } of repoPositions) {
        if (rRow === oldRow && rCol === oldCol) continue;

        const newNeighborCount = neighborCount(mapWithout, repoTile, rRow, rCol);

        if (newNeighborCount < oldNeighborCount) continue;

        if (!isContiguous(placed, repoTile, rRow, rCol)) continue;

        const validRepoTurns = legalRotations(repoTile, mapWithout, rRow, rCol, repoTile);

        for (const repoTurns of validRepoTurns) {
            const repoSimTile = { ...repoTile, place: { row: rRow, col: rCol }, turns: repoTurns };
            const placedAfter = [...placedWithout, repoSimTile];
            const mapAfter = buildMap(placedAfter);
            const repoMove = { tileId: repoTile.id, fromRow: repoTile.place.row, fromCol: repoTile.place.col, targetRow: rRow, targetCol: rCol, turns: repoTurns };
            results.push({ repoSimTile, placedAfter, mapAfter, repoMove });
        }
    }

    return results;
};

// ─── Main AI function ────────────────────────────────────────────────────────

export const getBestMove = (tiles, aiPlayer) => {
    const placed = getPlaced(tiles);
    const trayTile = tiles.find(t => t.player === aiPlayer && t.place === 'tray');

    if (!trayTile || placed.some(t => t === trayTile)) {
        console.warn('getBestMove: tray tile not ready or already placed.');
        return null;
    }

    const baseMap = buildMap(placed);

    if (placed.length === 0) {
        return { tileId: trayTile.id, targetRow: 0, targetCol: 0, turns: 0, reposition: null };
    }

    const baseScore = evaluateBoard(baseMap, placed, aiPlayer);

    let bestScore = -Infinity;
    let bestMove = null;

    const myPlaced = placed.filter(t => t.player === aiPlayer);

    // Helper: try placing tray tile on a given board state, update best if improved.
    // threshold: if a score >= threshold is found, return true immediately (early exit).
    // Use Infinity for steps 1 & 2 (always complete the search).
    // Use 5000 for step 3 (expensive — only short-circuit on very good moves).
    const tryPlacement = (placedState, mapState, reposition, reposition2, threshold = Infinity) => {
        const positions = candidatePositions(mapState, placedState);

        for (const { row, col } of positions) {
            if (neighborCount(mapState, null, row, col) === 0) continue;

            const validTurns = legalRotations(trayTile, mapState, row, col);

            for (const turns of validTurns) {
                const simTile = { ...trayTile, place: { row, col }, turns };
                const simPlaced = [...placedState, simTile];
                const simMap = buildMap(simPlaced);

                const score = evaluateBoard(simMap, simPlaced, aiPlayer) - baseScore;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        tileId: trayTile.id,
                        targetRow: row,
                        targetCol: col,
                        turns,
                        reposition: reposition || null,
                        reposition2: reposition2 || null,
                    };

                    if (bestMove.reposition?.fromRow === 9 && bestMove.reposition?.fromCol === 5) {
                        console.log('bestMove set with (9,5) reposition:', JSON.stringify(bestMove));
                        console.trace();
                    }
                }

                if (score >= threshold) return true;
            }
        }
        return false;
    };

    // ── Step 1: no reposition — always complete the full search ──────────────
    tryPlacement(placed, baseMap, null, null);

    // ── Step 2: one reposition — always complete the full search ─────────────
    for (const repoTile of myPlaced) {
        const repos = tryReposition(repoTile, placed, baseMap);

        for (const { placedAfter, mapAfter, repoMove } of repos) {
            tryPlacement(placedAfter, mapAfter, repoMove, null);
        }
    }

    // ── Step 3: two repositions — short-circuit on score >= 5000 ─────────────
    outer:
    for (const repoTile1 of myPlaced) {
        const repos1 = tryReposition(repoTile1, placed, baseMap);

        for (const { placedAfter: placed1, mapAfter: map1, repoMove: repoMove1 } of repos1) {
            const myPlaced1 = placed1.filter(t => t.player === aiPlayer);

            for (const repoTile2 of myPlaced1) {
                if (repoTile2.id === repoTile1.id) continue;

                const repos2 = tryReposition(repoTile2, placed1, map1);

                for (const { placedAfter: placed2, mapAfter: map2, repoMove: repoMove2 } of repos2) {
                    const goodEnough = tryPlacement(placed2, map2, repoMove1, repoMove2, 5000);
                    if (goodEnough) break outer;
                }
            }
        }
    }

    return bestMove;
};