import { type TrackingConfig } from "./config";

//-- track.staging.prochain.network reads Base Sepolia (84532).
const config: TrackingConfig = {
    CHAIN_ID: 84532,
    ENTITY_CONTRACT_ADDRESS: "0x49a098f0590bdd9F9CC5c619dD6C58152B645F3d",
    PRODUCTION_CONTRACT_ADDRESS: "0x9Fa6d8a566C21f8d30751344004884D0748a8709",
    RPC_URL: "https://sepolia.base.org",
    PROCHAIN_URL: "https://staging.prochain.network",
    BLOCK_EXPLORER_URL: "https://sepolia.basescan.org",
    INDEXER_URL: "https://indexer.dev.hyperindex.xyz/979e61b/v1/graphql",
};

export default config;
