import type { EntityProfileObject, GetPublicProductionResponseBody } from "../types/tracking";

const joinUrl = (baseUrl: string, path: string) => {
    return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export async function getPublicProduction(peerUrl: string, productionId: string): Promise<GetPublicProductionResponseBody> {
    const url = joinUrl(peerUrl, `/production/public/${productionId}`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load production ${productionId}`);
    }

    return response.json() as Promise<GetPublicProductionResponseBody>;
}

export async function getEntitySelf(peerUrl: string): Promise<EntityProfileObject> {
    const url = joinUrl(peerUrl, "/entity/self");
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load entity profile");
    }

    return response.json() as Promise<EntityProfileObject>;
}
