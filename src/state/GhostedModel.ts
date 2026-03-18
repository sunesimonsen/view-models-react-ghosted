import { ViewModel } from "@view-models/core";

export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "ready" | "playing" | "won" | "lost";

export type Cell = {
  row: number;
  col: number;
  hasGhost: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentGhosts: number;
};

export type GhostedState = Readonly<{
  difficulty: Difficulty;
  rows: number;
  cols: number;
  ghosts: number;
  grid: ReadonlyArray<ReadonlyArray<Cell>>;
  status: GameStatus;
  flagsLeft: number;
  revealedCount: number;
  elapsedSeconds: number;
  firstReveal: boolean;
}>;

const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { rows: number; cols: number; ghosts: number }
> = {
  easy: { rows: 8, cols: 8, ghosts: 10 },
  medium: { rows: 10, cols: 12, ghosts: 22 },
  hard: { rows: 12, cols: 16, ghosts: 38 },
};

const createEmptyGrid = (rows: number, cols: number): Cell[][] =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      hasGhost: false,
      revealed: false,
      flagged: false,
      adjacentGhosts: 0,
    })),
  );

const cloneGrid = (grid: ReadonlyArray<ReadonlyArray<Cell>>): Cell[][] =>
  grid.map((row) => row.map((cell) => ({ ...cell })));

const keyFor = (row: number, col: number) => `${row}:${col}`;

const neighborsFor = (row: number, col: number, rows: number, cols: number) => {
  const offsets = [-1, 0, 1];
  const neighbors: Array<[number, number]> = [];

  offsets.forEach((dr) => {
    offsets.forEach((dc) => {
      if (dr === 0 && dc === 0) return;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return;
      neighbors.push([nr, nc]);
    });
  });

  return neighbors;
};

const placeGhosts = (grid: Cell[][], ghosts: number, excluded: Set<string>) => {
  const positions: Array<[number, number]> = [];
  grid.forEach((row) =>
    row.forEach((cell) => {
      if (!excluded.has(keyFor(cell.row, cell.col))) {
        positions.push([cell.row, cell.col]);
      }
    }),
  );

  for (let i = positions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  positions.slice(0, ghosts).forEach(([row, col]) => {
    grid[row][col].hasGhost = true;
  });
};

const computeAdjacencies = (grid: Cell[][]) => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  grid.forEach((row) =>
    row.forEach((cell) => {
      const neighbors = neighborsFor(cell.row, cell.col, rows, cols);
      const count = neighbors.reduce(
        (total, [nr, nc]) => total + (grid[nr][nc].hasGhost ? 1 : 0),
        0,
      );
      cell.adjacentGhosts = count;
    }),
  );
};

const revealAllGhosts = (grid: Cell[][]) => {
  grid.forEach((row) =>
    row.forEach((cell) => {
      if (cell.hasGhost) {
        cell.revealed = true;
      }
    }),
  );
};

const floodReveal = (grid: Cell[][], startRow: number, startCol: number) => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const queue: Array<[number, number]> = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = keyFor(row, col);
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = grid[row][col];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;

    if (cell.adjacentGhosts === 0) {
      neighborsFor(row, col, rows, cols).forEach(([nr, nc]) => {
        const neighbor = grid[nr][nc];
        if (!neighbor.revealed && !neighbor.flagged) {
          queue.push([nr, nc]);
        }
      });
    }
  }
};

const deriveCounts = (grid: ReadonlyArray<ReadonlyArray<Cell>>) => {
  let revealedCount = 0;
  let flaggedCount = 0;
  let safeRevealed = 0;

  grid.forEach((row) =>
    row.forEach((cell) => {
      if (cell.revealed) {
        revealedCount += 1;
        if (!cell.hasGhost) safeRevealed += 1;
      }
      if (cell.flagged) flaggedCount += 1;
    }),
  );

  return { revealedCount, flaggedCount, safeRevealed };
};

export class GhostedModel extends ViewModel<GhostedState> {
  constructor() {
    const { rows, cols, ghosts } = DIFFICULTY_SETTINGS.easy;
    super({
      difficulty: "easy",
      rows,
      cols,
      ghosts,
      grid: createEmptyGrid(rows, cols),
      status: "ready",
      flagsLeft: ghosts,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: true,
    });
  }

  startGame = (difficulty: Difficulty = this.state.difficulty) => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const grid = createEmptyGrid(settings.rows, settings.cols);
    this.update({
      difficulty,
      rows: settings.rows,
      cols: settings.cols,
      ghosts: settings.ghosts,
      grid,
      status: "ready",
      flagsLeft: settings.ghosts,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: true,
    });
  };

  setDifficulty = (difficulty: Difficulty) => {
    this.startGame(difficulty);
  };

  tick = () => {
    if (this.state.status !== "playing") return;
    this.update({ elapsedSeconds: this.state.elapsedSeconds + 1 });
  };

  toggleFlag = (row: number, col: number) => {
    if (this.state.status === "won" || this.state.status === "lost") return;
    const grid = cloneGrid(this.state.grid);
    const cell = grid[row]?.[col];
    if (!cell || cell.revealed) return;
    cell.flagged = !cell.flagged;

    this.updateFromGrid(grid, this.state.status, this.state.firstReveal);
  };

  revealCell = (row: number, col: number) => {
    if (this.state.status === "won" || this.state.status === "lost") return;

    const grid = cloneGrid(this.state.grid);
    const cell = grid[row]?.[col];
    if (!cell || cell.flagged || cell.revealed) return;

    let firstReveal = this.state.firstReveal;
    let status: GameStatus =
      this.state.status === "ready" ? "playing" : this.state.status;

    if (firstReveal) {
      const excluded = new Set<string>([
        keyFor(row, col),
        ...neighborsFor(row, col, this.state.rows, this.state.cols).map(
          (item) => keyFor(item[0], item[1]),
        ),
      ]);
      placeGhosts(grid, this.state.ghosts, excluded);
      computeAdjacencies(grid);
      firstReveal = false;
    }

    if (cell.hasGhost) {
      revealAllGhosts(grid);
      status = "lost";
      this.updateFromGrid(grid, status, firstReveal);
      return;
    }

    floodReveal(grid, row, col);
    const counts = deriveCounts(grid);
    const safeCells = this.state.rows * this.state.cols - this.state.ghosts;
    if (counts.safeRevealed >= safeCells) {
      status = "won";
    }

    this.updateFromGrid(grid, status, firstReveal);
  };

  private updateFromGrid = (
    grid: Cell[][],
    status: GameStatus,
    firstReveal: boolean,
  ) => {
    const { revealedCount, flaggedCount } = deriveCounts(grid);
    this.update({
      grid,
      status,
      firstReveal,
      revealedCount,
      flagsLeft: Math.max(this.state.ghosts - flaggedCount, 0),
    });
  };
}
