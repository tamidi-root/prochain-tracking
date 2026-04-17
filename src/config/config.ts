import local from "./local";
import staging from "./staging";
import production from "./production";

export interface TrackingConfig {
    ENTITY_CONTRACT_ADDRESS: string;
    PRODUCTION_CONTRACT_ADDRESS: string;
    RPC_URL: string;
    PROCHAIN_URL: string;
}

const configs: Record<string, TrackingConfig> = { local, staging, production };

const env = import.meta.env.MODE === "development" ? "local" : import.meta.env.MODE;

export const config = configs[env];
