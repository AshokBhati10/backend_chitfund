/**
 * Auction Controller
 * Handles /api/run-auction endpoint
 */

const { getAllMembers } = require('../models/memberModel');
const { findWinner } = require('../services/aiService');

/**
 * POST /api/run-auction
 * Runs the auction and returns winner with scores
 */
const runAuction = (req, res) => {
  try {
    // Step 1: Fetch all members from mock database
    const members = getAllMembers();
    console.log(`📋 Loaded ${members.length} members for auction`);

    // Step 2: Run auction logic via AI service
    const result = findWinner(members);
    console.log(`🏆 Auction winner: ${result.winner}`);

    // Step 3: Return clean JSON response
    res.status(200).json({
      success: true,
      winner: result.winner,
      reason: result.reason,
      scores: result.scores,
      details: result.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Auction error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  runAuction,
};
