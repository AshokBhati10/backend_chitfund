# 🎨 Frontend Context — AI Chit Fund

## Role
You are building the user interface for an AI-based chit fund system.

## Responsibilities
- Display members and their scores
- Show auction process
- Display winner + explanation

## Key Screens
1. Dashboard
   - Member list
   - Urgency score
   - Risk level

2. Auction Panel (IMPORTANT)
   - Compare members
   - Highlight key signals (medical, salary)
   - Button: "Run Auction"

3. Result View
   - Winner name
   - Explanation text

## API Integration
POST http://localhost:5000/api/run-auction

## Rules
- Keep UI simple and clean
- Focus on demo clarity
- Use colors:
  - Red → Risk
  - Green → Safe
- Avoid complex state management

## Goal
Create a visually impressive demo that clearly shows:
- AI decision
- Reason behind decision