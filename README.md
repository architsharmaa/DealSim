# DealSim: AI-Powered Sales Roleplay Engine 🚀

DealSim is a high-fidelity sales training platform that allows sales representatives to practice complex deal scenarios with realistic, multi-persona AI buying committees. It provides real-time speech analytics, evidence-based feedback, and advanced sales methodology evaluations.

## ✨ Core Features

- **Realistic AI Buyer Behavior**: Skeptical, non-committal AI personas that require the seller to earn information.
- **Live Analytics Dashboard**: Real-time tracking of WPM, Filler Words, Talk Ratio, and Monologue detection via WebSockets.
- **Evidence-Based Evaluation**: Feedback points are automatically linked to direct "quoted excerpts" from the session transcript for accountability.
- **Premium Dark-Mode UI**: A state-of-the-art interface built for engagement and tactical focus.

## 🏆 Bonus Extensions Implemented (3/3)

1.  **Extension A: Webhook Delivery System**: Secure, HMAC-signed notifications for session completion and evaluation readiness.
2.  **Extension B: Multi-Persona Buying Committee**: Deterministic turn-taking logic that routes conversation to the most relevant stakeholder (CFO, IT lead, etc.) based on your sales pitch.
3.  **Extension C: Evaluation Framework Hot-Swap**: Retroactively re-score sessions against different sales methodologies like **MEDDIC** or **BANT**.

## 🏗️ Architecture

DealSim is built as a microservices-inspired monorepo:

- **`dealsim-frontend`**: React + Vite + Tailwind/Vanilla CSS. High-performance, reactive UI.
- **`dealsim-backend`**: Node.js/TypeScript Express server. Handles business logic, data persistence (MongoDB), and WebSocket orchestration.
- **`dealsim-ai-service`**: Dedicated AI Microservice. Manages conversation state, context-aware sentiment (GPT-4o), and multi-persona evaluation pipelines.

## 🚀 Quick Start

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

## 🛠️ Technical Optimizations

- **Context-Aware Sentiment**: Unlike basic sentiment analysis, DealSim uses the full conversation transcript to judge "Buying Temperature," correctly identifying friction even when the buyer is professionally polite.
- **Sub-Second Reactivity**: Custom WebSocket throttling and optimized math logic for real-time speech metrics.
- **Strict Validation**: Zod-based schemas ensure data integrity across all API layers.

---
Built for the PitchSense Engineering Challenge.
