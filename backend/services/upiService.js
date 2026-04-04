const axios = require('axios');
const env = require('../config/env.cjs');

const fallbackTransactions = (userId) => {
  const now = Date.now();
  return [
    {
      id: `${userId}-upi-1`,
      amount: 2500,
      type: 'DEBIT',
      status: 'captured',
      timestamp: new Date(now - 86400000).toISOString(),
      vpa: `${String(userId).toLowerCase()}@upi`,
    },
    {
      id: `${userId}-upi-2`,
      amount: 7000,
      type: 'CREDIT',
      status: 'captured',
      timestamp: new Date(now - 172800000).toISOString(),
      vpa: `${String(userId).toLowerCase()}@upi`,
    },
  ];
};

const mapRazorpayPayments = (payments, userId) => {
  return payments
    .filter((item) => {
      const notesUser = item.notes && (item.notes.userId || item.notes.user_id);
      return !notesUser || String(notesUser) === String(userId);
    })
    .map((item) => ({
      id: item.id,
      amount: Number(item.amount || 0) / 100,
      type: item.amount > 0 ? 'DEBIT' : 'CREDIT',
      status: item.status || 'unknown',
      timestamp: item.created_at
        ? new Date(item.created_at * 1000).toISOString()
        : new Date().toISOString(),
      vpa: item.vpa || (item.acquirer_data && item.acquirer_data.vpa) || '',
    }));
};

const fetchRazorpayTransactions = async (userId) => {
  if (!env.razorpay.key || !env.razorpay.secret) {
    return null;
  }

  const response = await axios.get(`${env.razorpay.baseUrl}/payments`, {
    auth: {
      username: env.razorpay.key,
      password: env.razorpay.secret,
    },
    params: { count: 25 },
    timeout: env.requestTimeoutMs,
  });

  const items = (response.data && response.data.items) || [];
  return mapRazorpayPayments(items, userId);
};

const fetchSetuTransactions = async (userId) => {
  if (!env.setu.apiKey) {
    return null;
  }

  const response = await axios.get(`${env.setu.baseUrl}/api/transactions`, {
    headers: {
      'x-api-key': env.setu.apiKey,
    },
    params: { userId },
    timeout: env.requestTimeoutMs,
  });

  const items = (response.data && response.data.transactions) || [];
  return items.map((item) => ({
    id: item.id,
    amount: Number(item.amount || 0),
    type: item.type || 'DEBIT',
    status: item.status || 'captured',
    timestamp: item.timestamp || new Date().toISOString(),
    vpa: item.vpa || '',
  }));
};

const getUPITransactions = async (userId) => {
  const errors = [];

  try {
    const razorpayTransactions = await fetchRazorpayTransactions(userId);
    if (razorpayTransactions && razorpayTransactions.length > 0) {
      return {
        source: 'razorpay',
        fallback: false,
        transactions: razorpayTransactions,
      };
    }
  } catch (error) {
    errors.push(`Razorpay: ${error.message}`);
  }

  try {
    const setuTransactions = await fetchSetuTransactions(userId);
    if (setuTransactions && setuTransactions.length > 0) {
      return {
        source: 'setu',
        fallback: false,
        transactions: setuTransactions,
      };
    }
  } catch (error) {
    errors.push(`Setu: ${error.message}`);
  }

  return {
    source: 'fallback',
    fallback: true,
    transactions: fallbackTransactions(userId),
    error: errors.length ? errors.join(' | ') : undefined,
  };
};

module.exports = {
  getUPITransactions,
};
