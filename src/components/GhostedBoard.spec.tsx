import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GhostedBoard } from "./GhostedBoard";
import { buildGrid, TestGhostedModel } from "../test/testUtils";

describe("GhostedBoard", () => {
  it("renders the grid with shimmer while ready", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(2, 3);

    model.seed({
      grid,
      rows: 2,
      cols: 3,
      ghosts: 0,
      status: "ready",
      flagsLeft: 0,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: true,
    });

    const { container } = render(
      <GhostedBoard
        grid={model.state.grid}
        status={model.state.status}
        flagMode={false}
        onReveal={vi.fn()}
        onFlag={vi.fn()}
      />,
    );

    const board = container.firstChild as HTMLElement;
    expect(board).toHaveClass("board", "shimmer");
    expect(board).toHaveStyle({
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    });
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });
});
