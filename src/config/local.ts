import { type TrackingConfig } from "./config";

//-- Local dev reads Base mainnet, where the real lots live.
const config: TrackingConfig = {
    CHAIN_ID: 8453,
    ENTITY_CONTRACT_ADDRESS: "0x60a6434BcB495fdcA8A9b2996A3aD6aa9667767b",
    PRODUCTION_CONTRACT_ADDRESS: "0xe4A32717d411395A983d0ba1b56B552a3564402e",
    RPC_URL: "https://mainnet.base.org",
    PROCHAIN_URL: "https://staging.prochain.network",
    BLOCK_EXPLORER_URL: "https://basescan.org",
    INDEXER_URL: "https://indexer.dev.hyperindex.xyz/979e61b/v1/graphql",
};

export default config;
