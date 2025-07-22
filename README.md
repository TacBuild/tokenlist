# TAC Token List

Official token registry for TAC Mainnet (Chain ID: 239).

## Usage

```bash
pnpm install
pnpm validate
```

## Adding a Token

> Please read [contributing.md](CONTRIBUTING.md) for details on how to add a token

1. Fork this repository
2. Add your token to `src/tokens/tac.json`
3. Add a 1024x1024 PNG logo to `src/assets/tokens/[address].png` (optional)
4. Run `pnpm validate` to check everything works
5. Submit a pull request

Pull requests are automatically validated. You'll get a comment with any issues to fix.

## Token Format

```json
{
  "chainId": 239,
  "address": "0x1234567890123456789012345678901234567890",
  "symbol": "TOKEN",
  "name": "Token Name",
  "decimals": 18,
  "logoURI": "https://example.com/logo.png",
  "tags": ["tag1", "tag2"]
}
```

### Required Fields

- `chainId`: Must be `239`
- `address`: Contract address
- `symbol`: Token symbol
- `name`: Token name
- `decimals`: Number of decimals

### Optional Fields

- `logoURI`: Link to token logo
- `tags`: Array of category tags
- `extensions`: Bridge addresses and other metadata

## Validation

The validation checks:

- JSON schema compliance
- Contract exists onchain
- Token metadata matches contract
- Image format and size (if provided)
- No duplicates

## Repository Structure

```
├── src/tokens/tac.json     # Main token list
├── src/assets/tokens/      # Token logos
├── schemas/                # JSON schemas
└── scripts/                # Validation scripts
```

## Development

```bash
pnpm run validate:json      # Schema validation
pnpm run validate:images    # Image validation
pnpm run validate:data      # Onchain validation
pnpm run lint               # Code linting
pnpm run check              # Type checking
```
