const { getAllMembers } = require('../models/memberModel');
const { getUPITransactions } = require('../services/upiService');
const { getBankData } = require('../services/bankService');
const { getCreditScore } = require('../services/creditService');
const { getAIPrediction } = require('../services/aiService');
const { recordAuction } = require('../services/blockchainService');

const evaluateMember = async (member) => {
  const [upiResult, bankData, creditData] = await Promise.all([
    getUPITransactions(member.id),
    getBankData(member.id),
    getCreditScore(member.id),
  ]);

  const aiPrediction = await getAIPrediction({
    transactions: upiResult.transactions,
    bankData,
    creditData,
    profile: member,
  });

  return {
    member,
    upiResult,
    bankData,
    creditData,
    aiPrediction,
  };
};

const runAuction = async (req, res) => {
  try {
    const members = getAllMembers();
    if (!members || members.length === 0) {
      return res.status(400).json({
        error: 'No members available for auction',
      });
    }

    const evaluatedMembers = await Promise.all(members.map((member) => evaluateMember(member)));
    const ranked = evaluatedMembers.sort(
      (a, b) => Number(b.aiPrediction.score || 0) - Number(a.aiPrediction.score || 0)
    );
    const winner = ranked[0];

    const scores = ranked.reduce((acc, item) => {
      acc[item.member.name] = Number(item.aiPrediction.score || 0);
      return acc;
    }, {});

    const blockchainResult = await recordAuction({
      winner: winner.member.name,
      reason: winner.aiPrediction.reason,
      scores,
    });

    res.status(200).json({
      winner: winner.member.name,
      reason: winner.aiPrediction.reason,
      scores,
      blockchain: {
        txHash: blockchainResult.txHash,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  runAuction,
};
