import type { Address } from "viem";

/**
 * This is a list of tokens that are allowed to does not match the on-chain name or symbol.
 *
 * DO NOT CHANGE THIS.
 */
export const ALLOWED_NAME_AND_SYMBOL_PATCHES: Address[] = [
  /**
   * ==============
   * MAINNET
   * ==============
   */

  // Native TAC token (special address that doesn't implement standard ERC-20)
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
];
