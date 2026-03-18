import { describe, expect, it, vi, afterEach } from "vitest";
import { GhostedModel } from "./GhostedModel";
import { buildGrid, TestGhostedModel } from "../test/testUtils";

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

describe("GhostedModel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets difficulty settings on start", () => {
    const model = new GhostedModel();

    model.startGame("medium");

    expect(model.state.difficulty).toBe("medium");
    expect(model.state.rows).toBe(10);
    expect(model.state.cols).toBe(12);
    expect(model.state.ghosts).toBe(22);
    expect(model.state.flagsLeft).toBe(22);
    expect(model.state.status).toBe("ready");
    expect(model.state.firstReveal).toBe(true);
    expect(model.state.grid).toHaveLength(10);
    expect(model.state.grid[0]).toHaveLength(12);
  });

  it("keeps the first reveal area ghost-free", () => {
    const model = new GhostedModel();
    vi.spyOn(Math, "random").mockReturnValue(0);

    model.revealCell(2, 2);

    const excluded = new Set<string>([
      "2:2",
      ...neighborsFor(2, 2, model.state.rows, model.state.cols).map(
        ([row, col]) => `${row}:${col}`,
      ),
    ]);

    excluded.forEach((key) => {
      const [row, col] = key.split(":").map(Number);
      expect(model.state.grid[row][col].hasGhost).toBe(false);
    });
    expect(model.state.firstReveal).toBe(false);
    expect(model.state.status).toBe("playing");
  });

  it("marks a revealed ghost as a loss", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(2, 2, {
      ghosts: [
        [0, 0],
        [1, 1],
      ],
    });

    model.seed({
      grid,
      rows: 2,
      cols: 2,
      ghosts: 2,
      status: "playing",
      flagsLeft: 2,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.revealCell(0, 0);

    expect(model.state.status).toBe("lost");
    expect(model.state.grid[0][0].revealed).toBe(true);
    expect(model.state.grid[1][1].revealed).toBe(true);
  });

  it("updates flag counts when toggling", () => {
    const model = new GhostedModel();

    model.toggleFlag(0, 0);

    expect(model.state.grid[0][0].flagged).toBe(true);
    expect(model.state.flagsLeft).toBe(model.state.ghosts - 1);
  });

  it("wins when every safe cell is revealed", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(2, 2, { ghosts: [[0, 0]] });

    model.seed({
      grid,
      rows: 2,
      cols: 2,
      ghosts: 1,
      status: "playing",
      flagsLeft: 1,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.revealCell(0, 1);
    model.revealCell(1, 0);
    model.revealCell(1, 1);

    expect(model.state.status).toBe("won");
    expect(model.state.revealedCount).toBe(3);
  });

  it("flood reveals empty neighbors", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(3, 3, { ghosts: [] });

    model.seed({
      grid,
      rows: 3,
      cols: 3,
      ghosts: 0,
      status: "playing",
      flagsLeft: 0,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.revealCell(1, 1);

    expect(model.state.revealedCount).toBe(9);
    expect(model.state.status).toBe("won");
  });

  it("ticks only while playing", () => {
    const model = new TestGhostedModel();

    model.seed({
      status: "ready",
      elapsedSeconds: 5,
    });

    model.tick();

    expect(model.state.elapsedSeconds).toBe(5);

    model.seed({
      status: "playing",
      elapsedSeconds: 5,
    });

    model.tick();

    expect(model.state.elapsedSeconds).toBe(6);
  });

  it("ignores actions after the game ends", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1, { revealed: [[0, 0]] });

    model.seed({
      grid,
      rows: 1,
      cols: 1,
      ghosts: 0,
      status: "won",
      flagsLeft: 0,
      revealedCount: 1,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.toggleFlag(0, 0);
    model.revealCell(0, 0);

    expect(model.state.grid[0][0].flagged).toBe(false);
    expect(model.state.grid[0][0].revealed).toBe(true);
  });

  it("skips revealing flagged cells", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1, { flagged: [[0, 0]] });

    model.seed({
      grid,
      rows: 1,
      cols: 1,
      ghosts: 0,
      status: "playing",
      flagsLeft: 0,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.revealCell(0, 0);

    expect(model.state.grid[0][0].revealed).toBe(false);
    expect(model.state.revealedCount).toBe(0);
  });

  it("skips flagging revealed cells", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1, { revealed: [[0, 0]] });

    model.seed({
      grid,
      rows: 1,
      cols: 1,
      ghosts: 1,
      status: "playing",
      flagsLeft: 1,
      revealedCount: 1,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.toggleFlag(0, 0);

    expect(model.state.grid[0][0].flagged).toBe(false);
    expect(model.state.flagsLeft).toBe(1);
  });

  it("caps flagsLeft at zero", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 2);

    model.seed({
      grid,
      rows: 1,
      cols: 2,
      ghosts: 1,
      status: "playing",
      flagsLeft: 1,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    model.toggleFlag(0, 0);
    model.toggleFlag(0, 1);

    expect(model.state.flagsLeft).toBe(0);
  });

  it("resets state on startGame", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(2, 2, {
      ghosts: [[0, 0]],
      revealed: [[1, 1]],
      flagged: [[0, 1]],
    });

    model.seed({
      grid,
      rows: 2,
      cols: 2,
      ghosts: 1,
      status: "playing",
      flagsLeft: 0,
      revealedCount: 1,
      elapsedSeconds: 12,
      firstReveal: false,
    });

    model.startGame("hard");

    expect(model.state.status).toBe("ready");
    expect(model.state.firstReveal).toBe(true);
    expect(model.state.revealedCount).toBe(0);
    expect(model.state.elapsedSeconds).toBe(0);
    expect(model.state.flagsLeft).toBe(model.state.ghosts);
  });
});
