# ⚙️ Backend Context — AI Chit Fund

## Role
You are the central system connecting frontend and AI module.

## Responsibilities
- Handle API requests
- Manage mock data
- Call AI logic
- Return clean JSON responses

## Core Endpoint
POST /api/run-auction

## Flow
1. Receive request
2. Fetch member data (mock or DB)
3. Send data to AI module
4. Get result
5. Return response

## Data Format
Member:
{
  name: string,
  medical: boolean,
  salary: boolean,
  withdrawals: boolean,
  risk: number (0–1)
}

## Rules
- Keep APIs simple
- Return clean JSON
- Avoid heavy architecture
- No business logic duplication (AI handles logic)

## Goal
Ensure smooth communication between frontend and AI