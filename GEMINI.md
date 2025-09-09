# Gemini Project Context: Fozzle (SingleFlow)

## Project Overview

This is a modern productivity web application called Fozzle (also referred to as SingleFlow). It's built on the "Signal vs. Noise" framework, designed to help users categorize tasks as either critical "Signal" or less important "Noise" to improve focus.

The application is a full-stack project utilizing a JAMstack architecture.

*   **Frontend:** A responsive single-page application (SPA) built with **React** and **TypeScript**.
*   **Backend:** A serverless backend powered by **Supabase**, which provides authentication, a **PostgreSQL** database with real-time capabilities, and auto-generated APIs.
*   **Styling:** **Tailwind CSS** is used for utility-first styling.
*   **State Management:** **Zustand** is used for client-side state management.
*   **Build Tool:** **Vite** provides a fast development and build experience.
*   **Deployment:** The project is deployed on **Vercel**.

Key features include secure Google and email/password authentication, drag-and-drop task management, an "Idea Parking Lot" for capturing thoughts, and a daily review system with analytics.

## Building and Running

The project uses `npm` as the package manager. Key scripts are defined in `package.json`.

### Prerequisites

*   Node.js (16+) and npm
*   A Supabase account and project credentials.

### Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    Create a `.env.local` file in the project root and add your Supabase project credentials:
    ```
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Set Up Database:**
    The database schema is defined in `complete-supabase-schema.sql`. This script should be run in the Supabase SQL editor to set up the necessary tables (`tasks`, `ideas`), functions, and Row Level Security (RLS) policies.

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Other Key Commands

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This command first runs the TypeScript compiler (`tsc`) and then uses Vite to build the production-ready assets in the `dist/` directory.

*   **Linting:**
    ```bash
    npm run lint
    ```
    This runs ESLint to check for code quality and style issues across all TypeScript and TSX files.

*   **Testing:**
    ```bash
    npm run test
    ```
    This runs the test suite using `vitest`.

## Development Conventions

*   **TypeScript:** The entire frontend codebase is written in TypeScript, and new contributions should be strongly typed.
*   **Component-Based Architecture:** The UI is built with React components, located in `src/components/`.
*   **State Management:**
    *   **Zustand** is the primary tool for managing client-side state. The main store is located at `src/store/useSupabaseStore.ts`, which handles state synced with the Supabase backend.
    *   React Context (`src/contexts/AuthContext.tsx`) is used for managing authentication state.
*   **Styling:** Utility-first classes from Tailwind CSS are used directly in the component files.
*   **Database Interaction:** All interactions with the Supabase backend are centralized in `src/lib/supabase.ts` (client setup) and `src/lib/database.ts` (service functions).
*   **Security:** Data privacy is enforced at the database level using Supabase's Row Level Security (RLS), ensuring users can only access their own data.
*   **Drag and Drop:** The `@dnd-kit` library is used for all drag-and-drop functionality. To ensure a stable and consistent user experience, the implementation separates the component in the list (`TaskCard`) from the component being dragged (`DraggedTaskCard`). The `DraggedTaskCard` is a simplified presentational component rendered in a `DragOverlay` to provide a consistent drag preview. The width of the card is captured when a drag begins and is applied to the overlay to prevent visual distortion.
