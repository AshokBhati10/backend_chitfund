# AI Chit Fund Backend - Real Ethereum Sepolia Integration

This backend executes auction logic and stores final results on Ethereum Sepolia using a deployed Solidity contract and ethers.js.

## Smart Contract

Contract: `AuctionStorage`

Stored fields per auction:
- `winner` (string)
- `reason` (string)
- `scores` (JSON string)
- `timestamp` (uint256)

Write function:
- `storeAuction(string winner, string reason, string scores)`

## 1) MetaMask and Wallet Setup

1. Install MetaMask browser extension.
2. Create/import a wallet.
3. Open MetaMask and switch to **Ethereum Sepolia** network.
4. Export your wallet private key (MetaMask -> Account details -> Export private key).
5. Put the private key in backend `.env` as `SEPOLIA_PRIVATE_KEY`.

## 2) Get Sepolia Test ETH

1. Copy your wallet address from MetaMask.
2. Use an official Sepolia faucet (for example Alchemy faucet pages).
3. Request test ETH for your wallet.
4. Confirm the balance appears in MetaMask before deploying.

## 3) Environment Variables

Create/update `.env` in `backend`:

```env
SEPOLIA_PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
CONTRACT_ADDRESS=
PORT=5000
```

`CONTRACT_ADDRESS` is empty before deployment. Fill it after deploying.

## 4) Install Dependencies

```bash
npm install
```

## 5) Compile and Deploy Contract

Compile:

```bash
npm run compile
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

or directly:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, copy printed address into `.env`:

```env
CONTRACT_ADDRESS=0xYourDeployedAuctionStorageAddress
```

## 6) Run Backend

```bash
npm run start
```

Server:
- Health: `GET /health`
- Auction execution: `POST /api/run-auction`

## 7) API Response Shape

Successful auction response includes real on-chain transaction hash:

```json
{
	"winner": "Ravi",
	"reason": "High urgency score",
	"scores": {
		"Ravi": 82.4,
		"Amit": 71.2
	},
	"blockchain": {
		"txHash": "0x..."
	}
}
```

## 8) Real Blockchain Flow

`services/blockchainService.js` performs:
1. Connect JSON-RPC provider using `SEPOLIA_RPC_URL`
2. Build signer with `SEPOLIA_PRIVATE_KEY`
3. Load `AuctionStorage` ABI from Hardhat artifacts
4. Call `storeAuction(winner, reason, JSON.stringify(scores))`
5. Wait for confirmation
6. Return `txHash`
