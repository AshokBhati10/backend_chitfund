/**
 * AI Service - Scoring Logic
 * Handles urgency + risk calculation
 * Can be extended to call Python AI module
 */

/**
 * Calculate urgency score based on member needs
 * +50 if medical need
 * +30 if no salary
 * +20 if previous withdrawals
 */
const calculateUrgency = (member) => {
  let urgency = 0;

  if (member.medical) urgency += 50;
  if (!member.salary) urgency += 30;
  if (member.withdrawals) urgency += 20;

  return urgency;
};

/**
 * Calculate final score using weighted formula
 * score = urgency * 0.6 + (1 - risk) * 0.4
 */
const calculateScore = (member) => {
  const urgency = calculateUrgency(member);
  const riskAdjusted = (1 - member.risk) * 100; // Normalize risk to 0-100 scale
  
  const score = urgency * 0.6 + riskAdjusted * 0.4;
  
  return Math.round(score * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate scores for all members and find winner
 */
const findWinner = (members) => {
  if (!members || members.length === 0) {
    throw new Error('No members available for auction');
  }

  // Calculate scores for all members
  const scores = {};
  const memberScores = members.map((member) => ({
    ...member,
    score: calculateScore(member),
  }));

  memberScores.forEach((member) => {
    scores[member.name] = member.score;
  });

  // Find winner (highest score)
  const winner = memberScores.reduce((prev, current) =>
    current.score > prev.score ? current : prev
  );

  // Generate reason
  const reasons = [];
  if (winner.medical) reasons.push('medical need');
  if (!winner.salary) reasons.push('no current salary');
  if (winner.withdrawals) reasons.push('previous withdrawals');
  const riskStatus = winner.risk < 0.3 ? 'low risk' : winner.risk < 0.6 ? 'moderate risk' : 'higher risk';

  const reason = `Selected ${winner.name} due to higher urgency and ${riskStatus} profile (${reasons.join(', ')})`;

  return {
    winner: winner.name,
    reason,
    scores,
    details: {
      urgency: calculateUrgency(winner),
      risk: winner.risk,
      finalScore: winner.score,
    },
  };
};

module.exports = {
  calculateUrgency,
  calculateScore,
  findWinner,
};
