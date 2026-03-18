import type { Cell, GhostedState } from "../state/GhostedModel";
import { GhostedModel } from "../state/GhostedModel";

type Position = [number, number];

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

export const buildGrid = (
  rows: number,
  cols: number,
  options?: {
    ghosts?: Position[];
    revealed?: Position[];
    flagged?: Position[];
  },
): Cell[][] => {
  const ghostKeys = new Set(
    (options?.ghosts ?? []).map(([r, c]) => keyFor(r, c)),
  );
  const revealedKeys = new Set(
    (options?.revealed ?? []).map(([r, c]) => keyFor(r, c)),
  );
  const flaggedKeys = new Set(
    (options?.flagged ?? []).map(([r, c]) => keyFor(r, c)),
  );

  const grid = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      hasGhost: ghostKeys.has(keyFor(row, col)),
      revealed: revealedKeys.has(keyFor(row, col)),
      flagged: flaggedKeys.has(keyFor(row, col)),
      adjacentGhosts: 0,
    })),
  );

  grid.forEach((row) =>
    row.forEach((cell) => {
      const neighbors = neighborsFor(cell.row, cell.col, rows, cols);
      cell.adjacentGhosts = neighbors.reduce(
        (total, [nr, nc]) => total + (grid[nr][nc].hasGhost ? 1 : 0),
        0,
      );
    }),
  );

  return grid;
};

export class TestGhostedModel extends GhostedModel {
  seed(state: Partial<GhostedState>) {
    this.update(state);
  }
}
