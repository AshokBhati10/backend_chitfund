# AI Chit Fund - Integration Architecture

This repository is organized as three deployable modules that integrate through simple HTTP contracts.

## System Architecture

```text
frontend (React UI)
		|
		| POST /api/run-auction
		v
backend (Node.js + Express)
		| 1) Collect member + UPI + bank + credit signals
		| 2) POST AI payload to /predict
		| 3) Persist result to Sepolia contract
		v
ai-module (FastAPI service)
		|
		| Returns urgency, risk, score, reason
		v
backend blockchain service (ethers + AuctionStorage)
```

## Module Boundaries

- frontend
	- Only calls backend APIs.
	- No AI logic and no blockchain logic.

- backend
	- Orchestrates business flow.
	- Calls ai-module at `AI_PREDICT_URL`.
	- Persists winner and scores on Sepolia through `AuctionStorage`.

- ai-module
	- Pure decision engine.
	- Exposes `POST /predict` and `GET /health`.
	- No blockchain and no frontend coupling.

## AI Service Contract (Used by Backend)

Request to `POST /predict`:

```json
{
	"transactions": [],
	"bankData": {},
	"creditData": {},
	"profile": {}
}
```

Response from `POST /predict`:

```json
{
	"urgency": 100,
	"risk": 0.25,
	"score": 60.3,
	"reason": "AI model: urgency 100, low risk, credit score 669 (medical need, no salary, past withdrawals)"
}
```

This response shape matches backend service expectations in the current codebase.

## Run the Integrated Stack

### 1) Start AI module

```bash
cd ai-module
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2) Start backend

```bash
cd backend
npm install
npm start
```

### 3) Start frontend (when UI is added)

```bash
cd frontend
npm install
npm run dev
```

## Backend Environment Requirement

In `backend/.env`, keep:

```env
AI_PREDICT_URL=http://localhost:8000/predict
```

For blockchain persistence:

```env
SEPOLIA_PRIVATE_KEY=...
SEPOLIA_RPC_URL=...
CONTRACT_ADDRESS=...
```

## Why This Architecture Integrates Cleanly

- Stable API contract between backend and ai-module.
- Clear service ownership (UI vs orchestration vs scoring).
- No direct dependency between frontend and ai-module.
- Easy to deploy independently or together.
