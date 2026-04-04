const axios = require('axios');
const env = require('../config/env');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round2 = (value) => Math.round(Number(value) * 100) / 100;

const calculateFallbackUrgency = (transactions, bankData, creditData, profile) => {
  const txList = Array.isArray(transactions) ? transactions : [];
  const failedTx = txList.filter((tx) => String(tx.status).toLowerCase() !== 'captured').length;

  let urgency = 0;
  if (profile && profile.medical) urgency += 50;
  if (profile && profile.salary === false) urgency += 30;
  if (profile && profile.withdrawals) urgency += 20;

  const income = Number(bankData.income || 0);
  const expenses = Number(bankData.expenses || 0);
  const balance = Number(bankData.balance || 0);
  const expenseRatio = income > 0 ? expenses / income : 0;

  if (expenses > income) urgency += 40;
  else if (expenseRatio >= 0.75) urgency += 25;

  if (balance < 10000) urgency += 25;
  if (failedTx > 0) urgency += 15;
  if (Number(creditData.score || 0) < 650) urgency += 20;

  return clamp(urgency, 0, 100);
};

const calculateFallbackRisk = (transactions, creditData) => {
  const txList = Array.isArray(transactions) ? transactions : [];
  const failedTx = txList.filter((tx) => String(tx.status).toLowerCase() !== 'captured').length;
  const txPenalty = txList.length > 0 ? failedTx / txList.length : 0;
  const creditRisk = Number(creditData.risk || 0.5);
  return clamp(round2(creditRisk * 0.8 + txPenalty * 0.2), 0, 1);
};

const buildFallbackReason = (urgency, risk, creditScore, profile) => {
  const riskTag = risk <= 0.35 ? 'low risk' : risk <= 0.6 ? 'moderate risk' : 'higher risk';
  const factors = [];
  if (profile && profile.medical) factors.push('medical need');
  if (profile && profile.salary === false) factors.push('no salary');
  if (profile && profile.withdrawals) factors.push('past withdrawals');
  return `Fallback AI: urgency ${urgency}, ${riskTag}, credit score ${creditScore}${factors.length ? ` (${factors.join(', ')})` : ''}`;
};

const fallbackPrediction = ({ transactions, bankData, creditData, profile }) => {
  const urgency = calculateFallbackUrgency(transactions, bankData, creditData, profile);
  const risk = calculateFallbackRisk(transactions, creditData);
  const score = round2(urgency * 0.6 + (1 - risk) * 0.4);

  return {
    urgency,
    risk,
    score,
    reason: buildFallbackReason(urgency, risk, Number(creditData.score || 0), profile),
    source: 'fallback',
  };
};

const normalizeRisk = (riskValue) => {
  const raw = Number(riskValue);
  if (!Number.isFinite(raw)) return 0.5;
  if (raw > 1) return clamp(round2(raw / 100), 0, 1);
  return clamp(round2(raw), 0, 1);
};

const getAIPrediction = async ({ transactions, bankData, creditData, profile }) => {
  try {
    const response = await axios.post(
      env.ai.predictUrl,
      { transactions, bankData, creditData, profile },
      { timeout: env.requestTimeoutMs }
    );

    const body = response.data || {};
    const urgency = Number(body.urgency);
    const risk = normalizeRisk(body.risk);
    const score = Number.isFinite(Number(body.score))
      ? round2(Number(body.score))
      : round2(urgency * 0.6 + (1 - risk) * 0.4);

    if (!Number.isFinite(urgency)) {
      throw new Error('AI response missing urgency');
    }

    return {
      urgency: round2(urgency),
      risk,
      score,
      reason: body.reason || 'AI prediction returned without reason',
      source: 'fastapi',
    };
  } catch (error) {
    const fallback = fallbackPrediction({ transactions, bankData, creditData, profile });
    return {
      ...fallback,
      error: error.message,
    };
  }
};

module.exports = {
  getAIPrediction,
};
