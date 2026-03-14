# DealSim: Sales Roleplay Engine

DealSim is a sales training platform that allows sales representatives to practice complex deal scenarios with realistic, multi-persona buying committees. It provides real-time speech analytics, evidence-based feedback, and advanced sales methodology evaluations.

## Core Features

- **Realistic Buyer Behavior**: Skeptical, non-committal personas that require the seller to earn information.
- **Live Analytics Dashboard**: Real-time tracking of WPM, Filler Words, Talk Ratio, and Monologue detection via WebSockets.
- **Evidence-Based Evaluation**: Feedback points are automatically linked to direct "quoted excerpts" from the session transcript for accountability.
- **Premium Dark-Mode UI**: A state-of-the-art interface built for engagement and tactical focus.

## Bonus Extensions Implemented (3/3)

1.  **Extension A: Webhook Delivery System**: Secure, HMAC-signed notifications for session completion and evaluation readiness.
2.  **Extension B: Multi-Persona Buying Committee**: Deterministic turn-taking logic that routes conversation to the most relevant stakeholder (CFO, IT lead, etc.) based on your sales pitch.
3.  **Extension C: Evaluation Framework Hot-Swap**: Retroactively re-score sessions against different sales methodologies like **MEDDIC** or **BANT**.

## Architecture

DealSim is built as a microservices-inspired monorepo:

- **`dealsim-frontend`**: React + Vite + Tailwind/Vanilla CSS. High-performance, reactive UI.
- **`dealsim-backend`**: Node.js/TypeScript Express server. Handles business logic, data persistence (MongoDB), and WebSocket orchestration.
- **`dealsim-ai-service`**: Dedicated Microservice. Manages conversation state, context-aware sentiment (GPT-4o), and multi-persona evaluation pipelines.

## Quick Start

1.  **Prerequisites**: Node.js v18+, MongoDB running locally.
2.  **Clone & Install**:
    ```bash
    git clone [repo-url]
    npm install
    ```
3.  **Configure**: Add your `OPENAI_API_KEY` to `dealsim-ai-service/.env`.
4.  **Run**:
    ```bash
    # From root
    npm run dev
    ```

## Design Decisions and Trade-offs

- **Decoupled Architecture**: I chose to isolate the core logic into a dedicated service. This allows the backend to remain a fast, lightweight state-manager while the specialized service handles the heavy lifting of prompt engineering and context-aware analysis. *Trade-off*: Adds network overhead between services but allows for independent scaling.
- **Hybrid Real-Time Delivery**: Used standard REST for chat messages for guaranteed delivery but implemented WebSockets exclusively for the high-frequency analytics snapshots. *Trade-off*: Simplifies message state-management while still providing the "wow" factor of a reactive dashboard.
- **Structured Prompting over Chaining**: I prioritized single-turn complex prompting with structured JSON output for evaluations. *Trade-off*: More rigorous prompt engineering was required to prevent hallucinations, but it avoids the latency tax of multi-step chains.
- **Critical Path Testing**: Automated unit tests for evaluation parsing, analytics computation, and secure webhook signing to ensure reliability.

## Assumptions Made

- **Estimated WPM**: Since this is a text-based roleplay, WPM is calculated based on characters-per-minute and assumed typing cadences. This is a proxy for voice conversation metrics.
- **Single User Context**: Per the assignment brief, I assumed a single-user environment and focused on session orchestration rather than auth/multi-tenancy.
- **MongoDB for Consistency**: Assumed the availability of a document store to handle the varying shapes of multi-persona transcripts and evaluation rubrics.

## What I'd Do Differently with More Time

- **Streaming Responses**: I would implement streaming for buyer replies to eliminate the perceived wait-time during complex turn-taking.
- **Robust Message Queuing**: For the Webhook system, I would introduce a task queue (like BullMQ or RabbitMQ) to handle retries more resiliently under high load.
- **Voice-to-Text Integration**: Adding a real-time STT layer would allow for true conversational pace analysis instead of the current character-based estimates.

## Design Document
[Design Document](https://docs.google.com/document/d/109LDcXaDvDfxeX8EENlW6nqf-dQcSoJaACWbTkGvhvk/edit?usp=sharing)

---
Built for the Engineering Challenge.
