<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SingleFlow Productivity App - Copilot Instructions

## Project Overview
SingleFlow is a productivity web application based on the Signal vs. Noise framework inspired by Steve Jobs. It helps users categorize tasks as either "Signal" (critical, important work) or "Noise" (distractions, non-essential tasks) to maintain focus on what truly matters.

## Key Features to Maintain
- **Signal vs. Noise Task Categorization**: Tasks are categorized as Signal (critical) or Noise (distractions)
- **Drag and Drop Interface**: Users can move tasks between categories
- **Progress Tracking**: 80/20 ratio visualization (80% Signal, 20% Noise)
- **Daily Review System**: End-of-day statistics and reflection
- **Idea Parking Lot**: Capture non-critical ideas without losing focus
- **Local Storage Persistence**: Save user data across sessions
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: Theme switching capability

## Technology Stack
- **React 18** with TypeScript for component-based architecture
- **Vite** for fast development and building
- **Tailwind CSS** for styling and responsive design
- **React DnD** or similar library for drag and drop functionality
- **Zustand** or Context API for state management
- **React Router** for navigation (if multi-page)

## Code Style Guidelines
- Use functional components with hooks
- Implement TypeScript interfaces for all data structures
- Follow React best practices for state management
- Use compound component patterns where appropriate
- Implement proper error boundaries
- Use semantic HTML for accessibility
- Follow responsive-first design principles

## Component Structure
- Keep components small and focused on single responsibilities
- Use custom hooks for complex logic
- Implement proper prop validation with TypeScript
- Use React.memo for performance optimization where needed

## State Management
- Use Zustand for global state (tasks, settings, progress)
- Local component state for UI-specific state
- Implement proper data persistence with localStorage
- Handle offline/online states gracefully

## Accessibility Requirements
- Implement proper ARIA labels for drag and drop
- Ensure keyboard navigation works throughout the app
- Maintain proper color contrast ratios
- Use semantic HTML elements
