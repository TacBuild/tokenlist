export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  [key: string]: unknown;
}
