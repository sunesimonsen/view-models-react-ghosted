import { GhostedCell } from "./GhostedCell";
import type { Cell, GameStatus } from "../state/GhostedModel";

type GhostedBoardProps = {
  grid: ReadonlyArray<ReadonlyArray<Cell>>;
  status: GameStatus;
  flagMode: boolean;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
};

export const GhostedBoard = ({
  grid,
  status,
  flagMode,
  onReveal,
  onFlag,
}: GhostedBoardProps) => (
  <div
    className={status === "ready" ? "board shimmer" : "board"}
    style={{
      gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, minmax(0, 1fr))`,
    }}
  >
    {grid.flatMap((row, rowIndex) =>
      row.map((cell) => (
        <GhostedCell
          key={`${rowIndex}-${cell.col}`}
          cell={cell}
          status={status}
          flagMode={flagMode}
          onReveal={onReveal}
          onFlag={onFlag}
        />
      )),
    )}
  </div>
);
