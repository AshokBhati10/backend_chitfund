# Backend - AI Chit Fund System

Production-style Express backend for AI chit fund winner selection with real integration points and sandbox/testnet support.

## Stack

- Express API layer
- Axios for external API integration
- FastAPI AI scoring integration
- Ethers.js for Polygon Mumbai transaction write
- Solidity smart contract for auction records

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy and populate environment values.

```bash
copy .env.example .env
```

3. Start backend.

```bash
npm start
```

Server starts at `http://localhost:5000`.

## API

### Health

`GET /health`

### Run Auction

`POST /api/run-auction`

Sample response:

```json
{
  "winner": "Ravi",
  "reason": "High urgency from spending pressure and moderate risk profile",
  "scores": {
    "Ravi": 54.12,
    "Amit": 37.88,
    "Priya": 42.31,
    "Vikram": 40.27,
    "Neha": 45.01
  },
  "blockchain": {
    "txHash": "0xabc123...",
    "skipped": false
  }
}
```

## Flow (`POST /api/run-auction`)

1. Load members from mock model.
2. For each member fetch:
   - UPI transactions from Razorpay/Setu sandbox (fallback if unavailable).
   - Bank data via Account Aggregator sandbox simulation (fallback if unavailable).
   - Credit score via credit provider sandbox (fallback if unavailable).
3. Send per-member payload to FastAPI `AI_PREDICT_URL`.
4. Rank users by AI score.
5. Select top scorer as winner.
6. Store winner/scores/reason on Polygon Mumbai contract.
7. Return clean JSON response.

## Project Structure

```
backend/
  config/
    env.js
  contracts/
    ChitAuctionRecorder.sol
  controllers/
    auctionController.js
  models/
    memberModel.js
  routes/
    auction.js
  scripts/
    deployContract.js
  services/
    upiService.js
    bankService.js
    creditService.js
    aiService.js
    blockchainService.js
  server.js
```

## Contract Deployment (Mumbai)

1. Populate `PRIVATE_KEY` and `POLYGON_RPC_URL` in `.env`.
2. Deploy contract:

```bash
npm run deploy:contract
```

3. Copy returned `contractAddress` into `.env` as `CONTRACT_ADDRESS`.
4. Restart backend.

## Notes

- When external providers are down or credentials are missing, services automatically return structured fallback data.
- FastAPI endpoint expected at `http://localhost:8000/predict` by default.
- Blockchain writes are non-blocking for business flow: if write fails, API still returns winner and score output with `blockchain.skipped = true`.
