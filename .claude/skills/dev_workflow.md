# Development Workflow

## Step 1: Plan First
- Break feature into:
  - Input
  - Logic
  - Output

## Step 2: Build in Isolation
- AI module builds logic separately
- Backend connects APIs
- Frontend consumes APIs

## Step 3: Integration Rule
- Backend is the central connector
- No direct frontend → AI calls

## Step 4: Testing
- Use Postman for backend
- Console logs for frontend

## Step 5: Demo Focus
- Prioritize:
  - Auction flow
  - Explanation output
  - Clean UI

## Prompt Template
"Implement X feature with simple logic, no overengineering, and return clean JSON output"