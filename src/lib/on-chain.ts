import { ethers } from "ethers";

import { config } from "../config/config";
import { uuidToBytes16 } from "../utils/data";

const IPFS_GATEWAY = "https://white-reasonable-tyrannosaurus-335.mypinata.cloud";

const entityAbi = [
    "function entityMetadataUri(address entityAddress) view returns (string)",
];

const productionAbi = [
    "function batchInfo(bytes16 productionUuid) view returns (address producer, uint64 producedAt, uint64 expirationDate)",
];

export async function getEntityPeerUrlRpc(entityAddress: string): Promise<string | undefined> {
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    const contract = new ethers.Contract(config.ENTITY_CONTRACT_ADDRESS, entityAbi, provider);

    try {
        const metadataUri: string = await contract.entityMetadataUri(entityAddress);
        if (!metadataUri) {
            return undefined;
        }

        const url = metadataUri.startsWith("ipfs://")
            ? metadataUri.replace("ipfs://", `${IPFS_GATEWAY}/ipfs/`)
            : metadataUri;

        const response = await fetch(url);
        const metadata = await response.json();
        return metadata?.peer_url || undefined;
    } catch {
        return undefined;
    }
}

export async function discoverProductionInfo(
    productionUuid: string,
): Promise<{ entityAddress: string; peerUrl: string; producedAt: number | null } | null> {
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    const contract = new ethers.Contract(config.PRODUCTION_CONTRACT_ADDRESS, productionAbi, provider);

    try {
        const info = await contract.batchInfo(uuidToBytes16(productionUuid));
        const producer: string = info.producer;
        const producedAt = info.producedAt ? Number(info.producedAt) * 1000 : null;

        if (!producer || producer === ethers.ZeroAddress) {
            return null;
        }

        const peerUrl = await getEntityPeerUrlRpc(producer);
        if (!peerUrl) {
            return null;
        }

        return {
            entityAddress: producer,
            peerUrl,
            producedAt,
        };
    } catch {
        return null;
    }
}
