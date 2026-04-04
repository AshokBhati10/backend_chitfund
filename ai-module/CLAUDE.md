# 🧠 AI Module Context — AI Chit Fund

## Role
You are responsible for decision-making logic in the system.

## Responsibilities
- Calculate urgency scores
- Evaluate risk
- Select auction winner
- Generate explanation

## Inputs
List of members with:
- medical flag
- salary status
- withdrawal activity
- risk score

## Logic

### Urgency Score
- Medical → +50
- No salary → +30
- Withdrawals → +20

### Auction Formula
final_score = urgency * 0.6 + (1 - risk) * 0.4

## Output
{
  "winner": string,
  "reason": string
}

## Explanation Rules
- Mention key factors (medical, salary, etc.)
- Keep it simple and human-readable

## Rules
- No heavy ML required
- Prefer deterministic logic
- Keep outputs consistent

## Goal
Simulate intelligent decision-making in a clear, explainable way