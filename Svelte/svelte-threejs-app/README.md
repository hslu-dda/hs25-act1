# 3D Animation Project - Setup Guide

This guide will help you run the animated 3D cube grid project on your computer using VS Code.

## What You'll Need

- **Visual Studio Code** (VS Code) - [Download here](https://code.visualstudio.com/)
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)

## Step 1: Install Visual Studio Code Extensions

1. Open VS Code
2. Click on the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for and install the following extension:
   - **Svelte for VS Code** (by Svelte)

## Step 2: Open the Project in VS Code

1. Download or clone this project to your computer
2. Open VS Code
3. Click **File** → **Open Folder**
4. Select the project folder
5. Click **Select Folder** (or **Open** on Mac)

## Step 3: Open the Terminal in VS Code

1. In VS Code, click **Terminal** in the top menu
2. Select **New Terminal**
3. A terminal window will open at the bottom of VS Code

## Step 4: Install Project Dependencies

In the terminal that just opened, type the following command and press Enter:

```bash
npm install
```

This will install all the necessary packages (Three.js, Svelte, etc.). It might take a minute or two.

**Wait until you see the terminal prompt again before moving to the next step!**

## Step 5: Run the Project

Once the installation is complete, type this command in the terminal and press Enter:

```bash
npm run dev
```

You should see something like this:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: View Your Project in the Browser

1. Hold `Ctrl` (or `Cmd` on Mac) and click on the link `http://localhost:5173/`
2. Or manually open your web browser and go to: `http://localhost:5173/`

You should now see the animated 3D cube grid!

## Interacting with the Scene

- **Rotate**: Click and drag with your mouse
- **Zoom**: Scroll with your mouse wheel
- The cubes animate automatically in a wave pattern

## Stopping the Server

When you're done, you can stop the development server:

1. Click in the terminal window
2. Press `Ctrl+C` (on both Windows and Mac)
3. Type `y` if asked to confirm

## Troubleshooting

### "npm: command not found"

- Make sure Node.js is installed correctly
- Close and reopen VS Code after installing Node.js

### Port already in use

- If you see an error about port 5173 being in use, try:
  ```bash
  npm run dev -- --port 5174
  ```

### Browser shows blank page

- Check the terminal for any error messages
- Try refreshing the browser page
- Make sure the dev server is still running (you should see "Local: http://localhost:5173/" in the terminal)

### Changes don't appear

- The project has hot-reload enabled, so changes should appear automatically
- If not, try refreshing your browser page

## Making Changes

Any changes you make to the `.svelte` files will automatically update in the browser (hot-reload). Just save your file in VS Code and watch the browser update!

## Project Structure

```
project-folder/
├── src/
│   ├── lib/
│   │   └── ThreeScene.svelte  ← The 3D animation code
│   ├── App.svelte              ← Main app component
│   └── main.js
├── package.json
└── README.md
```

## Need Help?

- Check the terminal for error messages
- Make sure all steps were completed in order
- Ask your instructor for help!

---

**Happy Coding! 🎨✨**
