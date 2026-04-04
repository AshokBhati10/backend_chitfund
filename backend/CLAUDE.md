# ⚙️ Backend Context — AI Chit Fund

## ✅ Status: COMPLETE

Backend is production-clean and ready for integration with frontend and AI module.

## Role
Central system connecting frontend and AI module. Bridge between user requests and scoring logic.

## Responsibilities
- ✅ Handle API requests (Express + CORS)
- ✅ Manage mock data (5 sample members)
- ✅ Calculate scores using urgency + risk formula
- ✅ Return clean JSON responses

## Core Endpoint
POST /api/run-auction

**Response Format:**
```json
{
  "success": true,
  "winner": "Ravi",
  "reason": "Selected Ravi due to higher urgency and low risk profile...",
  "scores": {
    "Ravi": 72.4,
    "Amit": 45.2
  },
  "details": {
    "urgency": 100,
    "risk": 0.2,
    "finalScore": 72.4
  },
  "timestamp": "2026-04-04T10:30:00.000Z"
}
```

## Implementation Details

### Project Structure
```
backend/
├── server.js                 # Express app (CORS, JSON middleware)
├── routes/auction.js         # Single route POST /api/run-auction
├── controllers/auctionController.js  # Request handler
├── models/memberModel.js     # Mock data (5 members)
├── services/aiService.js     # Scoring logic
└── package.json              # express, cors
```

### Scoring Formula
```
urgency = +50 (medical) + 30 (no salary) + 20 (withdrawals)
score = urgency * 0.6 + (1 - risk) * 0.4
```

### Mock Members
- Ravi: high urgency (medical + no salary + withdrawals), low risk → Expected winner
- Amit: low urgency, moderate risk
- Priya: moderate urgency, low risk
- Vikram: moderate urgency, moderate risk
- Neha: moderate urgency, high risk

## Setup

### Install & Run
```bash
npm install
npm start
```

Server: `http://localhost:5000`

### Test
```bash
curl -X POST http://localhost:5000/api/run-auction -H "Content-Type: application/json" -d '{}'
```

## Data Format
Member:
{
  id: number,
  name: string,
  medical: boolean,
  salary: boolean,
  withdrawals: boolean,
  risk: number (0–1)
}

## Architecture Principles

- ✅ **Modular**: Routes → Controllers → Services → Models
- ✅ **Simple**: No complex dependencies, no overengineering
- ✅ **Testable**: Each layer has single responsibility
- ✅ **Extensible**: Easy to swap mock data with DB or call Python AI module

## Future Extensions

1. **Connect to Python AI Module**
   - Replace scoring logic with HTTP call to FastAPI
   - Update `aiService.js` to fetch from `http://localhost:8000`

2. **Database Integration**
   - Replace `memberModel.js` with MongoDB/PostgreSQL queries
   - Add authentication

3. **Caching**
   - Add Redis for auction results

4. **Notifications**
   - Add Twilio mock notifications after winner selection

## Rules
- Keep APIs simple ✅
- Return clean JSON ✅
- Avoid heavy architecture ✅
- Modular and testable ✅

## Goal
✅ Smooth communication bridge between Frontend and AI Module at demo-ready quality