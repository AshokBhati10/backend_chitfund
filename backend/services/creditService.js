const axios = require('axios');
const env = require('../config/env');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const riskFromScore = (score) => {
  const normalized = clamp((score - 300) / 600, 0, 1);
  return Number((1 - normalized).toFixed(2));
};

const fallbackCredit = (userId) => {
  const seed = String(userId)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  const score = clamp(620 + (seed % 110), 300, 900);
  return {
    score,
    risk: riskFromScore(score),
    source: 'fallback',
    fallback: true,
  };
};

const getCreditFromApi = async (userId) => {
  const response = await axios.post(
    `${env.credit.baseUrl}/credit-score`,
    { userId, provider: env.credit.provider },
    {
      headers: {
        Authorization: `Bearer ${env.credit.apiKey}`,
      },
      timeout: env.requestTimeoutMs,
    }
  );

  const body = response.data || {};
  const score = Number(body.score || body.creditScore || 0);
  if (!score) {
    throw new Error('Credit API returned empty score');
  }

  return {
    score,
    risk: riskFromScore(score),
    source: env.credit.provider,
    fallback: false,
  };
};

const getCreditScore = async (userId) => {
  if (!env.credit.apiKey) {
    return fallbackCredit(userId);
  }

  try {
    return await getCreditFromApi(userId);
  } catch (error) {
    const fallback = fallbackCredit(userId);
    return {
      ...fallback,
      error: error.message,
    };
  }
};

module.exports = {
  getCreditScore,
};
