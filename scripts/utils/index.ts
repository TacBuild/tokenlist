import { createPublicClient, http, type PublicClient } from "viem";
import { tac, tacSPB } from "viem/chains";
import type { ValidChainName } from "../_constants";

const tacClient = createPublicClient({
  chain: tac,
  transport: http(),
  batch: {
    multicall: {
      wait: 10,
    },
  },
});

const spbClient = createPublicClient({
  chain: tacSPB,
  transport: http(),
  batch: {
    multicall: {
      wait: 10,
    },
  },
});

export const clients: Record<ValidChainName, PublicClient> = {
  tac: tacClient,
  tacSPB: spbClient,
};

export * from "./_formatAnnotation";
export * from "./_getMetadataInFolder";
export * from "./_isValidChainName";
