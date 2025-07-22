# TAC Token List

This repository contains the **canonical Token List** for TAC Mainnet (Chain ID: 239), providing standardized token metadata for wallets, DEXs, and other applications in the TAC ecosystem.

## Quick Start

```bash
# Install dependencies
pnpm install

# Validate token list
pnpm validate

# Run individual validations
pnpm run validate:json     # Schema validation
pnpm run validate:images   # Image validation
pnpm run validate:data     # On-chain data validation

# Linting and formatting
pnpm run lint
pnpm run check
pnpm run format
```

## Repository Structure

```
├── src/
│   ├── tokens/           # Token registry files
│   │   └── tac.json     # TAC Mainnet token list
│   ├── assets/          # Token logos and images
│   │   └── tokens/      # Token logo files (1024x1024 PNG)
│   └── types/           # TypeScript type definitions
├── schemas/             # JSON schema validation
├── scripts/             # Validation and utility scripts
└── .github/workflows/   # GitHub Actions for PR validation
```

## Features

### Token Categories

- **TAC Native**: Native TAC ecosystem tokens with yield-bearing capabilities
- **Cross-Chain Bridged**: Tokens bridged via LayerZero, HyperLane, and AggLayer
- **TON Native**: TON blockchain native tokens wrapped as ERC-20
- **Stablecoins**: USD-pegged stable assets (USDT, USN, USD0, USR)
- **Bitcoin Derivatives**: Wrapped Bitcoin variants (cbBTC, LBTC, M-BTC)
- **Ethereum Assets**: Wrapped ETH and liquid staking tokens (WETH, wstETH)

### Cross-Chain Integration

Tokens include bridge extensions for seamless cross-chain operations:

- **TON Jettons**: Corresponding TON blockchain addresses
- **LayerZero OFTs**: Omnichain Fungible Token adapters
- **Bridge Adapters**: Ethereum and BSC bridge contract addresses

### Automated Validation

- **Schema Validation**: JSON structure and format validation
- **Image Validation**: Logo format, size, and quality checks
- **On-Chain Verification**: Contract address and metadata validation
- **Cross-Reference Checks**: Bridge address verification

## Contributing & Pull Requests

### For Token Issuers

1. **Fork** this repository
2. **Add your token** to `src/tokens/tac.json`
3. **Upload logo** to `src/assets/tokens/` (use contract address as filename)
4. **Run validation** locally: `pnpm validate`
5. **Submit Pull Request**

### Automated PR Validation

Every PR triggers automated validation that checks:

- ✅ JSON schema compliance
- ✅ Image format and size (1024x1024 PNG)
- ✅ On-chain contract verification
- ✅ Code quality and formatting
- ✅ Cross-chain bridge data accuracy

**Status Comments**: GitHub Actions automatically comments on PRs with validation results and actionable feedback.

### Token Requirements

```json
{
  "chainId": 239,
  "address": "0x1234567890123456789012345678901234567890",
  "symbol": "TOKEN",
  "name": "Example Token",
  "decimals": 18,
  "logoURI": "https://approved-domain.com/logo.png",
  "tags": ["tac-native", "yieldbearing"],
  "extensions": {
    "jetton": "TON_JETTON_ADDRESS",
    "oftAdapterETH": "LAYERZERO_ADAPTER_ADDRESS"
  }
}
```

**Required Fields:**

- `chainId`: Must be `239` for TAC Mainnet
- `address`: Valid ERC-20 contract address
- `symbol`: Token ticker (2-10 characters)
- `name`: Full token name
- `decimals`: Token decimal places (0-18)

**Optional Extensions:**

- `jetton`: TON blockchain mirror address
- `oftAdapterETH/BSC`: LayerZero bridge adapters
- Custom bridge or protocol-specific addresses

### Logo Requirements

- **Format**: PNG with solid background (no transparency)
- **Size**: 1024x1024 pixels exactly
- **Naming**: Use contract address (e.g., `0x1234...7890.png`)
- **Quality**: High resolution, clear branding
