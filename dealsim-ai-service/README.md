# DealSim AI Microservice 🧠

The intelligence layer of DealSim. A dedicated service for LLM orchestration, conversation state, and evaluation.

## 🚀 Performance Features

- **Context-Aware Sentiment (GPT-4o)**: Evaluates buyer sentiment based on conversation history. It recognizes when a seller's rudeness kills a deal, even if the buyer stays professional.
- **Multi-Persona Intelligence**: Bridges multiple personas into a cohesive "Buying Committee" simulation.
- **Structured Output**: Custom evaluation pipeline that parses LLM responses into strictly typed JSON for the core API.

## 🛠️ Prompt Engineering

- **No "Helpful Assistants"**: Buyers are programmed for realistic resistance, skepticism, and proactive objection handling.
- **Stakeholder Personas**: Distinct prompt templates for CFOs, IT Directors, and End-Users.
- **Evidence Mandate**: Evaluation prompts are engineered to require direct "quoted excerpts" from the transcript.

## 📁 Structure

- `/src/services/llmGateway`: Wrapper for OpenAI/Vertex interaction with retry logic.
- `/src/services/promptRegistry`: Centralized version-controlled prompt templates.
- `/src/services/evaluationEngine`: Logic for sentiment mapping and competency scoring.

## 🚦 Local Setup

1. `npm install`
2. **CRITICAL**: Add `OPENAI_API_KEY` to `.env`.
3. `npm run dev` (Runs on Port 3001).
