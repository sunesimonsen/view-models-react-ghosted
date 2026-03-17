# Ghosted Demo with @view-models/react

Ghosted is a minesweeper-inspired showcase built with React. Instead of mines, the mansion hides ghosts behind doors.

## Features

- Minesweeper-style board with door tiles
- First reveal is always safe (including neighbors)
- Flag mode for touch devices
- Difficulty presets and reset
- Themed UI with SVG ghost and door assets

## Tech Stack

- **React 19** - UI library
- **@view-models/core** - View model state management
- **@view-models/react** - React integration (`useModelState` hook)
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/    # UI building blocks
├── state/         # View models and context
├── App.tsx        # App composition
└── index.css      # Global styling
```

## Architecture

The project follows the **View Model pattern**:

- **View Model** (`src/state/GhostedModel.ts`) - Game rules and state
- **Hooks** (`src/state/GhostedContext.tsx`) - Model subscription
- **Components** (`src/components/`) - Pure UI elements

## License

MIT License

Copyright (c) 2026 Sune Simonsen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
