# 🏆 Placement Prep Tracker - Complete Full-Stack Architecture Details

Welcome to the official developer handbook and architecture documentation for the **Placement Prep Tracker**. This document provides an in-depth, file-by-file breakdown of the entire full-stack codebase. It explains **what** languages and libraries are used, **why** they were selected, and **how** every component integrates to create a cohesive client-server ecosystem.

---

## 🛠️ Technology Stack & Languages Used

This project is built using a modern, lightweight, high-performance web engineering stack divided into two distinct layers:

### 1. The Frontend (Client-Side Application)
* **HTML5**: Used as the structural blueprint for rendering interface frameworks.
* **TypeScript (TS & TSX)**: Extends standard JavaScript by adding strict compile-time types. This prevents silent execution bugs (like passing undefined props) and provides autocompletion inside the code editor.
* **Vanilla CSS (with Tailwind utilities)**: Tailors sleek neon gradients, responsive columns, dark mode panels, and transitions.
* **React (v18)**: A component-based interface library. React operates using a virtual DOM to dynamically re-render changing states (like Pomodoro timers or live heatmaps) instantly.
* **Vite**: A hyper-fast bundler that uses native ES Modules to hot-reload code changes (HMR) instantly during development and compile minified static assets for production.

### 2. The Backend (Server-Side Application)
* **JavaScript (Node.js)**: Runs server-side scripts outside the web browser. Node.js operates on an asynchronous event-driven model, making it exceptionally fast for handling simultaneous API requests.
* **Express.js**: A lightweight routing framework for Node.js. It maps URL routes (like `/api/questions`) to backend handlers.
* **ExcelJS**: A powerful workbook processor. It programmatically reads, formats, and appends records directly onto Excel sheets without needing Microsoft Excel installed on the hosting server.
* **JSON Databases**: Light, server-side JSON flat-files that require zero database configuration. They are highly portable and fast for reading/writing user profiles.

---

## 📂 File-by-File Breakdown & Architectural Roles

```
PLACEMENT-PREP-TRACKER (Project Root)
├── placement.xlsx (Spreadsheet logs)
├── DETAILS.md (This documentation)
├── package.json (Workspace dependency tree)
│
├── backend (Node.js Server Folder)
│   ├── package.json (Backend library mappings)
│   ├── server.js (Express REST API & Static File Server)
│   ├── data (Server-side JSON Database files)
│   │   ├── profiles.json (User profile database)
│   │   ├── questions.json (DSA solved tracker database)
│   │   └── memos.json (Personal cheat sheet database)
│   └── utils
│       └── excelLogger.js (ExcelJS programmatic sheet logger)
│
└── placement-prep-tracker (React Client Folder)
    ├── package.json (Vite/React dependency mappings)
    ├── vite.config.ts (Vite local dev server port & host rules)
    ├── tailwind.config.js / postcss.config.js (CSS utilities)
    └── src (Source code directory)
        ├── main.tsx (React mounting point)
        ├── App.tsx (Security auth gate, layout distributor, toasts)
        ├── config.ts (Dynamic Hostname API routing config)
        ├── index.css (Central stylesheet for obsidian theme gradients)
        ├── stores (State management logs)
        │   ├── authStore.ts (XP, levels, active streak updates)
        │   ├── questionStore.ts (DSA solves lists, infinite generator)
        │   └── uiStore.ts (Neon themes, layout sidebar, toast states)
        ├── components
        │   └── layout
        │       └── Sidebar.tsx (Collapsible drawer navigation, sign out)
        └── pages (Interface view panels)
            ├── Auth
            │   └── Login.tsx (Custom monochrome welcome gate, slider)
            ├── Dashboard
            │   └── Dashboard.tsx (Solve Heatmap, LeetCode sync, recommendations)
            ├── QuestionBank
            │   └── QuestionBank.tsx (Collapsible solution codes, search filters)
            ├── StudyPlanner
            │   └── StudyPlanner.tsx (DSA map, Pomodoro timer, ambient synths)
            ├── MockInterview
            │   └── MockInterview.tsx (Whiteboard compiler, JS test runner)
            ├── Leaderboard
            │   └── Leaderboard.tsx (Simulated ranking grid, achievements badges)
            └── Notes
                └── Notes.tsx (Boilerplates database, scratchpad notes syncer)
```

---

### 1. Root & Deployment Configurations

#### 📄 [DETAILS.md](file:///c:/Users/kisho/Downloads/placement-prep-tracker/DETAILS.md) (Markdown)
* **Role**: The document you are reading right now! Serves as a full architectural guide.

#### 📄 [placement.xlsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement.xlsx) (Excel)
* **Role**: The centralized workbook updated by the backend server. It records all logins under the **"Logins"** worksheet and all solved questions under the **"Solves"** worksheet.

---

### 2. Backend Server Components (`/backend`)

#### 📄 [backend/package.json](file:///c:/Users/kisho/Downloads/placement-prep-tracker/backend/package.json) (JSON)
* **Role**: Defines the backend dependencies:
  * `express` (routing)
  * `cors` (enabling frontend cross-origin requests)
  * `exceljs` (writing spreadsheets)

#### 📄 [backend/server.js](file:///c:/Users/kisho/Downloads/placement-prep-tracker/backend/server.js) (JavaScript)
* **Role**: The heart of the backend server. It executes the following functions:
  * Mounts static file serving (`express.static`) targeting the compiled React `/dist` directory. This allows the backend to host the frontend assets directly on the same port!
  * Serves as an API router exposing REST routes:
    * `POST /api/auth/login`: Handles registration, checks `profiles.json`, loads profiles, and logs logins to `placement.xlsx`.
    * `POST /api/auth/update`: Dynamically updates and syncs changing profile metrics (XP, level, streaks, badges).
    * `GET /api/questions`: Fetches customized user DSA problem lists.
    * `POST /api/questions`: Saves updates or adds problems, logging solved events directly to Excel.
    * `DELETE /api/questions`: Deletes specific problems.
    * `POST /api/questions/reset`: Wipes progress to restore the default starting questions list.
    * `GET` & `POST /api/memos`: Reads and writes persistent notepad cheat sheets.

#### 📄 [backend/utils/excelLogger.js](file:///c:/Users/kisho/Downloads/placement-prep-tracker/backend/utils/excelLogger.js) (JavaScript)
* **Role**: Manages the connection, creation, formatting, and file-write locks for the `placement.xlsx` spreadsheet at the root of the project. Ensures cells are written using clean formatting (bold headers, custom widths, string dates).

#### 📄 [backend/data/](file:///c:/Users/kisho/Downloads/placement-prep-tracker/backend/data) (`profiles.json`, `questions.json`, `memos.json`) (JSON Files)
* **Role**: Server-side JSON databases. They persist profiles, progress questions, and memos, keeping them safe, portable, and extremely fast to load.

---

### 3. Frontend Store Mappings (`/src/stores`)

#### 📄 [src/config.ts](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/config.ts) (TypeScript)
* **Role**: Resolves backend routes dynamically! If the app hostname is `localhost` or `127.0.0.1` (development), it points API calls to `http://localhost:5000`. Otherwise (production remote tunnel), it resolves to relative paths `""` targeting the same tunnel domain serving the page.

#### 📄 [src/stores/uiStore.ts](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/stores/uiStore.ts) (TypeScript)
* **Role**: Controls client-side layout adjustments: selected theme colors (`dark`, `midnight`, `cyberpunk`), sidebar open/collapsed state, and global toast notifications.

#### 📄 [src/stores/authStore.ts](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/stores/authStore.ts) (TypeScript)
* **Role**: Synchronizes profile data:
  * Computes levels (Level = Math.floor(XP / 1000) + 1).
  * Automatically increments streaks if problems are solved consecutive days.
  * Dispatches `POST` updates to `/api/auth/update` silently in the background on every XP gain or streak update.

#### 📄 [src/stores/questionStore.ts](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/stores/questionStore.ts) (TypeScript)
* **Role**: Manages DSA problem CRUD operations:
  * Connects `addQuestion`, `updateQuestion`, `deleteQuestion`, and `resetQuestions` to backend API endpoints with optimistic client-side UI states.
  * Implements `generateEndless(...)` to procedurally construct unique technical challenges (LRU caches, cycle detection,power sets, course schedulers) when requested.

---

### 4. Collapsible Drawer Layout Components

#### 📄 [src/components/layout/Sidebar.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/components/layout/Sidebar.tsx) (TypeScript React)
* **Role**: The gorgeous navigation control panel. Features collapsible menus, live level metrics progress bars, streak flame icons, and a secure logout button.

---

### 5. Frontend Pages (`/src/pages`)

#### 📄 [src/pages/Auth/Login.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/Auth/Login.tsx) (TypeScript React)
* **Role**: A premium glassmorphic authentication gate. Let's new users enter a nickname, dynamically configure daily targets using custom range sliders, select themes on the fly, and fires a confetti celebration upon entering.

#### 📄 [src/pages/Dashboard/Dashboard.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/Dashboard/Dashboard.tsx) (TypeScript React)
* **Role**: Serves as the central overview panel:
  * **Solves Heatmap Calendar**: A custom-engineered grid displaying 53 weeks (371 days) of preparation history, shading cells from dark gray to bright neon green based on the daily solved counts.
  * **LeetCode Sync**: A profile widget where entering a username generates random imports and awards custom XP.
  * **Problem Recommendation Algorithms**: Suggests focus topics (Strings, Graphs, DP) based on current progress.

#### 📄 [src/pages/QuestionBank/QuestionBank.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/QuestionBank/QuestionBank.tsx) (TypeScript React)
* **Role**: The main DSA catalog. Supports status updates, detailed review notes writing, custom problem imports, and collapsible blocks to read code answers.

#### 📄 [src/pages/StudyPlanner/StudyPlanner.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/StudyPlanner/StudyPlanner.tsx) (TypeScript React)
* **Role**: The ultimate focused study arena:
  * **Pomodoro Clock**: Renders interactive circular SVG progress timers.
  * **Ambient Audio Synthesizers**: Programmed using the native browser Web Audio API, synthesizing real-time white noise and low-frequency brain waves to enhance concentration without external media files.
  * ** DSA Curriculum Roadmap**: Connects logical DSA checkpoints inside a visual timeline.

#### 📄 [src/pages/MockInterview/MockInterview.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/MockInterview/MockInterview.tsx) (TypeScript React)
* **Role**: The AI Mock Simulator:
  * Provides coding canvas areas for solving questions.
  * Runs an **in-browser evaluator** utilizing JavaScript compilation (`new Function()`), testing candidates' whiteboard inputs against test cases and scoring outputs in real-time.

#### 📄 [src/pages/Leaderboard/Leaderboard.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/Leaderboard/Leaderboard.tsx) (TypeScript React)
* **Role**: Promotes gamified learning by rendering simulated peer ranks based on solved count stats, displaying earned badges, and listing milestones.

#### 📄 [src/pages/Notes/Notes.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/Notes/Notes.tsx) (TypeScript React)
* **Role**: Algorithmic Boilerplate Library. Features searchable generic patterns (BFS, DFS, Binary Search, Two Pointers) and connects your personal preparation scratchpad directly to the backend database.

#### 📄 [src/pages/Settings/Settings.tsx](file:///c:/Users/kisho/Downloads/placement-prep-tracker/placement-prep-tracker/src/pages/Settings/Settings.tsx) (TypeScript React)
* **Role**: Configures preferences, manages live color theme switches, exports complete JSON database backups for portability, and processes client-server database purges.

---

## 📈 Key Full-Stack Architectures & Custom Tunnels

### 1. Unified Single-Port Hosting (Vite React + Express)
Previously, the frontend and backend ran on separate ports (3000 and 5000). To simplify deployment, we integrated **Static Serving** inside Express (`server.js`). Now, when the frontend is compiled (`npm run build`), all files are output to `/dist`. Express serves this static folder. When you connect to Port `5000` (locally or via tunnel), Express returns the index page and handles backend APIs under the same port!

### 2. Hostname-Based Relative Routing
To prevent cross-origin issues or managing multiple links, `src/config.ts` checks the browser's current `hostname`:
* If running locally (`localhost`), it routes APIs to `http://localhost:5000`.
* If running remotely (via the LocalTunnel URL), it uses relative paths (`""`). The browser automatically resolves the API queries to the exact same tunnel domain that loaded the webpage.

### 3. Auto-Healing Local Tunnel Loop
To secure a permanent connection on any network (including mobile data), we created a PowerShell restarter loop that runs the tunnel:
```powershell
while (1) { npx localtunnel --port 5000 --subdomain placement-prep-kishore; Start-Sleep -Seconds 2 }
```
If LocalTunnel's servers experience a connection drop, the loop automatically catches it, sleeps for 2 seconds, and restarts the tunnel immediately, keeping the link online indefinitely.
