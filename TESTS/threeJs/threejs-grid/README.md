# Three.js Animated Grid

An interactive 3D grid visualization built with Three.js featuring animated cubes with wave effects and isometric camera view.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd threejs-grid
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

Start the development server:

```bash
npm run dev
```

This will start Vite's development server. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
threejs-grid/
├── index.html      # HTML entry point
├── main.js         # Main Three.js code
├── style.css       # CSS styles
├── package.json    # Project dependencies and scripts
└── README.md       # This file
```

## Controls

- **Left Mouse Button**: Rotate the camera around the scene
- **Mouse Wheel**: Zoom in/out
- **Keyboard**: Currently no keyboard controls implemented (see `handleKeyPress` function in `main.js`)

## Technologies Used

- **Three.js** - 3D graphics library
- **Vite** - Build tool and development server
- **OrbitControls** - Camera control system
- **LineSegments2** - Thick line rendering for cube edges

## Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Vite Documentation](https://vitejs.dev/)
