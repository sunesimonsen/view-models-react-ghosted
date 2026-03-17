import type { MouseEvent } from "react";
import type { Cell, GameStatus } from "../state/GhostedModel";
import { DoorClosedIcon, GhostIcon } from "./icons";

type GhostedCellProps = {
  cell: Cell;
  status: GameStatus;
  flagMode: boolean;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
};

export const GhostedCell = ({
  cell,
  status,
  flagMode,
  onReveal,
  onFlag,
}: GhostedCellProps) => {
  const isLocked = status === "won" || status === "lost";
  const onClick = () => {
    if (isLocked) return;
    if (flagMode) {
      onFlag(cell.row, cell.col);
      return;
    }
    onReveal(cell.row, cell.col);
  };

  const onContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isLocked) return;
    onFlag(cell.row, cell.col);
  };

  return (
    <button
      className={
        cell.revealed
          ? cell.hasGhost
            ? "cell cell-ghost"
            : "cell cell-open"
          : cell.flagged
            ? "cell cell-flagged"
            : "cell"
      }
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={`Door ${cell.row + 1}-${cell.col + 1}`}
    >
      {!cell.revealed && !cell.flagged && (
        <DoorClosedIcon className="door-icon" />
      )}
      {!cell.revealed && cell.flagged && (
        <span className="flag" aria-hidden="true">
          <span className="flag-pole" />
          <span className="flag-banner" />
        </span>
      )}
      {cell.revealed && cell.hasGhost && <GhostIcon className="ghost-icon" />}
      {cell.revealed && !cell.hasGhost && cell.adjacentGhosts === 0 && (
        <span className="count empty" data-count={cell.adjacentGhosts}>
          {cell.adjacentGhosts}
        </span>
      )}
      {cell.revealed && !cell.hasGhost && cell.adjacentGhosts > 0 && (
        <span className="count" data-count={cell.adjacentGhosts}>
          {cell.adjacentGhosts}
        </span>
      )}
    </button>
  );
};
