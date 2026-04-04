# Auction Prompt Template

Task:
Run auction on given members and return winner.

Steps:
1. Calculate urgency
2. Compute final score
3. Rank members
4. Select winner
5. Generate explanation

Output format:
{
  "winner": "...",
  "reason": "..."
}