import { useEffect, useState } from "react";

import { getPeerProduct } from "../lib/api";
import { getEntities, getProducts, type EntityRecord } from "../lib/indexer";

//-- Names for the explorer. The indexer carries only ids for productions, so producers and products are
//-- resolved separately: producers from the indexer (their names are on-chain), products from the
//-- indexer when the product NFT is registered, and otherwise from the producer's own peer backend,
//-- whose URL is itself on-chain. Nothing here calls the proChain API by a hardcoded address.

export interface ProductInfo {
    name?: string;
    unit?: string;
    photoUrl?: string;
}

//-- Module-level caches: names do not change while a page is open, and the explorer re-renders the
//-- same ids on every page and poll.
const entityCache = new Map<string, Promise<EntityRecord | undefined>>();
const productCache = new Map<string, Promise<ProductInfo>>();

function loadEntities(addresses: string[]): void {
    const missing = [...new Set(addresses.map((address) => address.toLowerCase()))].filter(
        (address) => !entityCache.has(address),
    );
    if (!missing.length) {
        return;
    }

    const batch = getEntities(missing).catch(() => [] as EntityRecord[]);
    for (const address of missing) {
        entityCache.set(
            address,
            batch.then((records) => records.find((record) => record.id === address)),
        );
    }
}

function loadProducts(pairs: { productUuid: string; entity?: string }[]): void {
    const missing = pairs.filter((pair, index) => {
        return !productCache.has(pair.productUuid) && pairs.findIndex((p) => p.productUuid === pair.productUuid) === index;
    });
    if (!missing.length) {
        return;
    }

    loadEntities(missing.flatMap((pair) => (pair.entity ? [pair.entity] : [])));
    const onChain = getProducts(missing.map((pair) => pair.productUuid)).catch(() => []);

    for (const { productUuid, entity } of missing) {
        productCache.set(
            productUuid,
            (async () => {
                const registered = (await onChain).find((record) => record.productUuid === productUuid);
                const producer = entity ? await entityCache.get(entity.toLowerCase()) : undefined;

                if (!producer?.peerUrl) {
                    return { name: registered?.name || undefined };
                }

                try {
                    const { product } = await getPeerProduct(producer.peerUrl, productUuid);
                    return {
                        name: product?.name || registered?.name || undefined,
                        unit: product?.unit,
                        photoUrl: product?.photo_url,
                    };
                } catch {
                    return { name: registered?.name || undefined };
                }
            })(),
        );
    }
}

//-- Resolves whatever ids the caller passes; re-renders as names arrive. Unknown ids stay absent, and
//-- the UI falls back to a short id.
export function useExplorerNames(
    producerAddresses: string[],
    products: { productUuid: string; entity?: string }[],
): { producers: Record<string, EntityRecord>; products: Record<string, ProductInfo> } {
    const [producers, setProducers] = useState<Record<string, EntityRecord>>({});
    const [productInfo, setProductInfo] = useState<Record<string, ProductInfo>>({});

    const producerKey = [...new Set(producerAddresses.map((address) => address.toLowerCase()))].sort().join(",");
    const productKey = products
        .map((pair) => `${pair.productUuid}:${pair.entity ?? ""}`)
        .sort()
        .join(",");

    useEffect(() => {
        let active = true;
        const addresses = producerKey ? producerKey.split(",") : [];
        loadEntities(addresses);

        for (const address of addresses) {
            entityCache.get(address)?.then((record) => {
                if (active && record) {
                    setProducers((current) => (current[address] ? current : { ...current, [address]: record }));
                }
            });
        }

        return () => {
            active = false;
        };
    }, [producerKey]);

    useEffect(() => {
        let active = true;
        const pairs = productKey
            ? productKey.split(",").map((pair) => {
                  const [productUuid, entity] = pair.split(":");
                  return { productUuid, entity: entity || undefined };
              })
            : [];
        loadProducts(pairs);

        for (const { productUuid } of pairs) {
            productCache.get(productUuid)?.then((info) => {
                if (active) {
                    setProductInfo((current) => (current[productUuid] ? current : { ...current, [productUuid]: info }));
                }
            });
        }

        return () => {
            active = false;
        };
    }, [productKey]);

    return { producers, products: productInfo };
}
