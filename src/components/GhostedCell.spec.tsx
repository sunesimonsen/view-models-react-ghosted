import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GhostedCell } from "./GhostedCell";
import { buildGrid, TestGhostedModel } from "../test/testUtils";

describe("GhostedCell", () => {
  it("renders flagged doors", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1, { flagged: [[0, 0]] });

    model.seed({
      grid,
      rows: 1,
      cols: 1,
      ghosts: 1,
      status: "playing",
      flagsLeft: 0,
      revealedCount: 0,
      elapsedSeconds: 0,
      firstReveal: false,
    });

    const { container } = render(
      <GhostedCell
        cell={model.state.grid[0][0]}
        status={model.state.status}
        flagMode={false}
        onReveal={vi.fn()}
        onFlag={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Door 1-1" });
    expect(button).toHaveClass("cell-flagged");
    expect(container.querySelector(".flag")).toBeInTheDocument();
  });

  it("reveals on click when flag mode is off", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1);
    const onReveal = vi.fn();
    const onFlag = vi.fn();

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

    render(
      <GhostedCell
        cell={model.state.grid[0][0]}
        status={model.state.status}
        flagMode={false}
        onReveal={onReveal}
        onFlag={onFlag}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Door 1-1" }));

    expect(onReveal).toHaveBeenCalledWith(0, 0);
    expect(onFlag).not.toHaveBeenCalled();
  });

  it("flags on click when flag mode is on", () => {
    const model = new TestGhostedModel();
    const grid = buildGrid(1, 1);
    const onReveal = vi.fn();
    const onFlag = vi.fn();

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

    render(
      <GhostedCell
        cell={model.state.grid[0][0]}
        status={model.state.status}
        flagMode={true}
        onReveal={onReveal}
        onFlag={onFlag}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Door 1-1" }));

    expect(onFlag).toHaveBeenCalledWith(0, 0);
    expect(onReveal).not.toHaveBeenCalled();
  });
});
