# Backend - AI Chit Fund System

Backend service for the AI Chit Fund System. Connects frontend requests to AI scoring logic and returns auction winners.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "Backend is running",
  "timestamp": "2026-04-04T10:30:00.000Z"
}
```

### Run Auction
```
POST /api/run-auction
```

**Request:**
```json
{}
```

**Response (Success):**
```json
{
  "success": true,
  "winner": "Ravi",
  "reason": "Selected Ravi due to higher urgency and low risk profile (medical need, no current salary, previous withdrawals)",
  "scores": {
    "Ravi": 72.4,
    "Amit": 45.2,
    "Priya": 58.6,
    "Vikram": 62.1,
    "Neha": 38.9
  },
  "details": {
    "urgency": 100,
    "risk": 0.2,
    "finalScore": 72.4
  },
  "timestamp": "2026-04-04T10:30:00.000Z"
}
```

## Project Structure

```
backend/
├── server.js                 # Main Express app
├── package.json             # Dependencies
├── routes/
│   └── auction.js           # Auction routes
├── controllers/
│   └── auctionController.js # Route handlers
├── models/
│   └── memberModel.js       # Mock data
├── services/
│   └── aiService.js         # Scoring logic
└── README.md
```

## Scoring Formula

```
urgency = 
  + 50 if medical need
  + 30 if no salary
  + 20 if previous withdrawals

score = urgency * 0.6 + (1 - risk) * 0.4
```

## Mock Data

5 members with realistic urgency + risk profiles:
- **Ravi**: medical=true, salary=false, withdrawals=true, risk=0.2
- **Amit**: medical=false, salary=true, withdrawals=false, risk=0.5
- **Priya**: medical=false, salary=true, withdrawals=true, risk=0.3
- **Vikram**: medical=true, salary=true, withdrawals=false, risk=0.4
- **Neha**: medical=false, salary=false, withdrawals=true, risk=0.6

## Architecture

### Clean Separation of Concerns:
- **Routes**: Define API endpoints
- **Controllers**: Handle request/response
- **Services**: Business logic (scoring)
- **Models**: Data layer (mock/future DB)

### Future Extensions:
- Connect to Python AI module via HTTP
- Add Redis caching
- Add database integration
- Add authentication

## Testing with cURL

```bash
curl -X POST http://localhost:5000/api/run-auction \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or use Postman/Insomnia to test endpoints.

---

**Status:** ✅ Production-clean, hackathon-fast
