const express = require('express');
const { runAuction } = require('../controllers/auctionController');

const router = express.Router();

// POST /api/run-auction
router.post('/run-auction', runAuction);

module.exports = router;
