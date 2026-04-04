# Project: AI Chit Fund System

## Rules
- Keep code modular (AI, Backend, Frontend separated)
- Do NOT overcomplicate with heavy infra (Kafka, LSTM not required)
- Prefer simple logic over complex ML
- Always return explainable outputs

## Tech Stack
- Frontend: React
- Backend: Node.js (Express)
- AI: Python (FastAPI / simple scripts)

## API Contract
POST /run-auction

Response:
{
  "winner": string,
  "reason": string,
  "scores": object
}

## Coding Guidelines
- Use clean function-based logic
- Keep APIs RESTful
- Avoid unnecessary dependencies

## Goal
Build a demo-ready system with:
- AI Auctioneer
- Risk + Urgency scoring
- Explainable output