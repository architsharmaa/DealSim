# DealSim Backend

The core orchestrator for the DealSim ecosystem. Built with Node.js, TypeScript, and Express.

## Roles

- **RESTful API**: Orchestrates the roleplay lifecycle (Scenarios, Sessions, Evaluations).
- **WebSocket Gateway**: (Socket.io) Pushes real-time analytics snapshots (WPM, filler words) to the frontend.
- **Webhook Delivery**: Reliable event emission with HMAC-SHA256 signing and exponential backoff retry logic.
- **Domain Modeling**: Mongoose-based schemas for Personas, Contexts, Rubrics, and Sessions.

## Key Features

- **Strict Input Validation**: Every request is validated using Zod middleware (e.g., ensuring rubric weights sum to exactly 100%).
- **Preliminary Analytics**: Emits immediate UI updates after a seller message, improving perceived latency while the response processes.
- **Framework Comparison**: Supports multiple evaluations per session, allowing historical re-scoring.

## Structure

- `/src/controllers`: Request handlers and business logic.
- `/src/services`: Core engines (Analytics, Persona Turns, Webhooks).
- `/src/models`: Type-safe MongoDB/Mongoose schemas.
- `/src/middleware`: Error handling, Zod validation, and Auth logic.

## Local Setup

1. `npm install`
2. Ensure `.env` is configured (Port 3000).
3. `npm run dev`
