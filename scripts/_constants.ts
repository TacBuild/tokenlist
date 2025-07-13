import type { Address } from "viem";

export const VALID_CHAIN_NAMES = ["tac", "tacSPB"] as const;

export type ValidChainName = (typeof VALID_CHAIN_NAMES)[number];

export const CASE_SENSITIVE_ADDRESSES = false;
