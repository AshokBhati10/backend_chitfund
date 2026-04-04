const axios = require('axios');
const env = require('../config/env');

const fallbackBankData = (userId) => {
  const numeric = Number(userId) || String(userId).length;
  const balance = 20000 + numeric * 1800;
  const income = 45000 + numeric * 2200;
  const expenses = 30000 + numeric * 1900;

  return {
    consentId: `consent-${userId}`,
    balance,
    income,
    expenses,
    source: 'fallback',
    fallback: true,
  };
};

const createConsent = async (userId) => {
  const response = await axios.post(
    `${env.accountAggregator.baseUrl}/consents`,
    { userId, purpose: 'chit-fund-auction' },
    {
      headers: {
        Authorization: `Bearer ${env.accountAggregator.apiKey}`,
      },
      timeout: env.requestTimeoutMs,
    }
  );

  return response.data && response.data.consentId;
};

const fetchFinancialInfo = async (consentId) => {
  const response = await axios.post(
    `${env.accountAggregator.baseUrl}/financial-information/fetch`,
    { consentId },
    {
      headers: {
        Authorization: `Bearer ${env.accountAggregator.apiKey}`,
      },
      timeout: env.requestTimeoutMs,
    }
  );

  return (response.data && response.data.data) || {};
};

const getBankData = async (userId) => {
  if (!env.accountAggregator.apiKey) {
    return fallbackBankData(userId);
  }

  try {
    const consentId = await createConsent(userId);
    const data = await fetchFinancialInfo(consentId);

    return {
      consentId,
      balance: Number(data.balance || 0),
      income: Number(data.income || 0),
      expenses: Number(data.expenses || 0),
      source: 'account-aggregator',
      fallback: false,
    };
  } catch (error) {
    const fallback = fallbackBankData(userId);
    return {
      ...fallback,
      error: error.message,
    };
  }
};

module.exports = {
  getBankData,
};
