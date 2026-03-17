import { useMemo, useState, useEffect } from "react";
import "./App.css";
import { GhostedBoard } from "./components/GhostedBoard";
import {
  GhostedContext,
  useGhostedModel,
  useGhostedState,
} from "./state/GhostedContext";
import { GhostedModel } from "./state/GhostedModel";

const StatusBanner = () => {
  const { status } = useGhostedState();

  switch (status) {
    case "won":
      return "All ghosts found. The mansion rests.";
    case "lost":
      return "Haunted! A ghost slipped out.";
    case "playing":
      return "Listen for whispers and open carefully.";
    default:
      return "Choose a door to begin the haunting.";
  }
};

const GhostedApp = () => {
  const model = useGhostedModel();
  const state = useGhostedState();
  const [flagMode, setFlagMode] = useState(false);

  useEffect(() => {
    if (state.status !== "playing") return undefined;
    const timer = window.setInterval(() => model.tick(), 1000);
    return () => window.clearInterval(timer);
  }, [model, state.status]);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-title">
          <span className="hero-kicker">Ghosted</span>
          <h1>Behind Every Door</h1>
        </div>
        <p className="hero-tagline">
          A minesweeper-inspired haunting built with @view-models/react.
        </p>
        <div className="hero-controls">
          <div className="stat">
            <span className="stat-label">Ghosts</span>
            <span className="stat-value">{state.flagsLeft}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{state.elapsedSeconds}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Doors</span>
            <span className="stat-value">
              {state.rows * state.cols - state.revealedCount}
            </span>
          </div>
        </div>
      </header>

      <section className="game-panel">
        <div className="game-toolbar">
          <div className="difficulty">
            <button
              className={state.difficulty === "easy" ? "chip active" : "chip"}
              onClick={() => model.setDifficulty("easy")}
            >
              Easy
            </button>
            <button
              className={state.difficulty === "medium" ? "chip active" : "chip"}
              onClick={() => model.setDifficulty("medium")}
            >
              Medium
            </button>
            <button
              className={state.difficulty === "hard" ? "chip active" : "chip"}
              onClick={() => model.setDifficulty("hard")}
            >
              Hard
            </button>
          </div>
          <div className="toolbar-actions">
            <button
              className={flagMode ? "chip active" : "chip"}
              onClick={() => setFlagMode((current) => !current)}
            >
              Flag mode
            </button>
            <button className="reset" onClick={() => model.startGame()}>
              Reset
            </button>
          </div>
        </div>

        <p className="status-banner">
          <StatusBanner />
        </p>

        <GhostedBoard
          grid={state.grid}
          status={state.status}
          flagMode={flagMode}
          onReveal={model.revealCell}
          onFlag={model.toggleFlag}
        />
      </section>
    </div>
  );
};

function App() {
  const model = useMemo(() => new GhostedModel(), []);

  return (
    <GhostedContext.Provider value={model}>
      <GhostedApp />
    </GhostedContext.Provider>
  );
}

export default App;
