import type { EntityDetailObject, EntityProfileObject, GetPublicProductionResponseBody, ProductDetailObject, ProductIngredientObject, ProductObject } from "../types/tracking";

export interface GetPublicProductResponse {
    product: ProductObject;
    ingredients: ProductIngredientObject[];
    details: ProductDetailObject[];
}

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

export async function getPeerProduct(peerUrl: string, productId: string): Promise<GetPublicProductResponse> {
    const url = joinUrl(peerUrl, `/product/peer/${productId}`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load product ${productId}`);
    }

    return response.json() as Promise<GetPublicProductResponse>;
}

export interface GetPeerProductsResponse {
    total: number;
    records: ProductObject[];
}

export async function getPeerProducts(peerUrl: string, limit: number, page: number): Promise<GetPeerProductsResponse> {
    const url = joinUrl(peerUrl, `/product/peer?limit=${limit}&page=${page}`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load products");
    }

    return response.json() as Promise<GetPeerProductsResponse>;
}

export async function getEntityDetails(peerUrl: string, entityAddress: string): Promise<EntityDetailObject[]> {
    const url = joinUrl(peerUrl, `/entitydetail/public/${entityAddress}`);
    const response = await fetch(url);

    if (!response.ok) {
        return [];
    }

    const body = await response.json() as { records?: EntityDetailObject[] };
    return body.records || [];
}
