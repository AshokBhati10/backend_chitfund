const dotenv = require('dotenv');

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 5000),
  requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, 10000),
  razorpay: {
    key: process.env.RAZORPAY_KEY || '',
    secret: process.env.RAZORPAY_SECRET || '',
    baseUrl: process.env.RAZORPAY_BASE_URL || 'https://api.razorpay.com/v1',
  },
  setu: {
    apiKey: process.env.SETU_API_KEY || '',
    baseUrl: process.env.SETU_BASE_URL || 'https://uat.setu.co',
  },
  accountAggregator: {
    apiKey: process.env.AA_API_KEY || '',
    baseUrl: process.env.AA_BASE_URL || 'https://sandbox.accountaggregator.com',
  },
  credit: {
    provider: process.env.CREDIT_PROVIDER || 'experian',
    apiKey: process.env.CREDIT_API_KEY || '',
    baseUrl: process.env.CREDIT_API_BASE_URL || 'https://sandbox-api.experian.com',
  },
  ai: {
    predictUrl: process.env.AI_PREDICT_URL || 'http://localhost:8000/predict',
  },
  blockchain: {
    privateKey: process.env.PRIVATE_KEY || '',
    rpcUrl: process.env.POLYGON_RPC_URL || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    chainId: parseNumber(process.env.POLYGON_CHAIN_ID, 80001),
  },
};

env.blockchain.enabled =
  Boolean(env.blockchain.privateKey) &&
  Boolean(env.blockchain.rpcUrl) &&
  Boolean(env.blockchain.contractAddress);

module.exports = env;
