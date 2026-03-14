# DealSim Frontend

A premium, reactive sales coaching interface built with React, Vite, and modern styling.

## Top-Tier UI/UX

- **Live Roleplay Deck**: Immersive chat experience with persona badges and participant context.
- **Real-Time Diagnostics**: Dynamic gauges for Sentiment, Talk Ratio, and WPM that update as you type.
- **Evidence-Based Reporting**: Interactive reports that highlight "Gold Standard" quotes and "High Friction" moments.
- **Glassmorphic Design**: Clean, modern dark mode with subtle micro-animations for a premium feel.

## Technical Stack

- **Core**: React 18 + TypeScript.
- **State/Data**: TanStack Query (React Query) for robust server-state management.
- **Communication**: Socket.io-client for low-latency live analytics.
- **Icons**: Material Symbols (Rounded) for a cohesive enterprise look.

## Key Components

- **`SessionPage.tsx`**: The main live simulation hub.
- **`ReportsPage.tsx`**: Post-session visualization and feedback.
- **`SimulationsPage.tsx`**: Scenario setup and Buying Committee configuration.
- **`useSessionSocket.ts`**: High-performance hook for real-time data sync.

## Local Setup

1. `npm install`
2. `npm run dev` (Runs on Port 5173).
