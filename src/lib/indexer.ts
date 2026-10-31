import { config } from "../config/config";

//-- The explorer only ever shows Base mainnet. There is no staging tracking site, and the indexer
//-- also carries Base Sepolia, so every query pins the chain explicitly.
export const EXPLORER_CHAIN_ID = 8453;
export const EXPLORER_BLOCK_EXPLORER_URL = "https://basescan.org";

const SECONDS_PER_DAY = 86400;

//-- UTC day number, as the indexer's DailyStats.day.
export const toDay = (unixSeconds: number) => Math.floor(unixSeconds / SECONDS_PER_DAY);
export const today = () => toDay(Date.now() / 1000);

//-- Envio serialises BigInt columns as strings.
export interface ProductionRecord {
    id: string;
    entity: string;
    productionUuid: string;
    productUuid: string;
    batchTokenId: string;
    quantity: string;
    inputCount: number;
    expirationDate: string;
    txHash: string;
    blockTimestamp: string;
}

export interface GlobalStatsRecord {
    productionCount: number;
    producerCount: number;
    productCount: number;
    entityCount: number;
    lastProductionAt: string;
}

export interface DailyStatsRecord {
    day: number;
    productionCount: number;
    activeProducers: number;
    newProducts: number;
    newEntities: number;
}

export interface EntityRecord {
    id: string;
    name?: string | null;
    peerUrl: string;
}

export interface ProductRecord {
    productUuid: string;
    name?: string | null;
    entity: string;
}

export interface CountRecord {
    key: string;
    productionCount: number;
}

async function query<T>(text: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(config.INDEXER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, variables }),
    });

    if (!response.ok) {
        throw new Error(`Indexer responded ${response.status}`);
    }

    const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
    if (body.errors?.length || !body.data) {
        throw new Error(body.errors?.[0]?.message || "Indexer returned no data");
    }

    return body.data;
}

//-- Filters the production list understands. Every field is optional; together they are ANDed.
export interface ProductionFilter {
    //-- Only productions from the last N days. Resolved against the clock when the query runs.
    sinceDays?: number;
    producers?: string[];
    products?: string[];
    hasInputs?: boolean;
    notExpired?: boolean;
    txHash?: string;
    //-- Free-text search, already resolved to ids: a row matches if its producer OR its product does.
    search?: { producers: string[]; products: string[] };
}

function toWhere(filter: ProductionFilter): Record<string, unknown> {
    const and: Record<string, unknown>[] = [{ chainId: { _eq: EXPLORER_CHAIN_ID } }];
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (filter.sinceDays) {
        and.push({ blockTimestamp: { _gte: String(nowSeconds - filter.sinceDays * SECONDS_PER_DAY) } });
    }
    if (filter.producers?.length) {
        and.push({ entity: { _in: filter.producers } });
    }
    if (filter.products?.length) {
        and.push({ productUuid: { _in: filter.products } });
    }
    if (filter.hasInputs) {
        and.push({ inputCount: { _gt: 0 } });
    }
    if (filter.notExpired) {
        //-- 0 means the batch never expires.
        and.push({
            _or: [{ expirationDate: { _eq: "0" } }, { expirationDate: { _gt: String(nowSeconds) } }],
        });
    }
    if (filter.search) {
        and.push({
            _or: [
                { entity: { _in: filter.search.producers } },
                { productUuid: { _in: filter.search.products } },
            ],
        });
    }
    if (filter.txHash) {
        and.push({ txHash: { _eq: filter.txHash.toLowerCase() } });
    }

    return { _and: and };
}

const PRODUCTION_FIELDS = `
    id entity productionUuid productUuid batchTokenId quantity inputCount expirationDate txHash blockTimestamp
`;

//-- Newest first. Asks for one row more than a page so the caller knows whether an older page exists
//-- without a count query, which the hosted indexer does not serve.
export async function getProductions(
    filter: ProductionFilter,
    limit: number,
    offset: number,
): Promise<{ records: ProductionRecord[]; hasMore: boolean }> {
    const data = await query<{ ProductionBatch: ProductionRecord[] }>(
        `query Productions($where: ProductionBatch_bool_exp!, $limit: Int!, $offset: Int!) {
            ProductionBatch(where: $where, order_by: [{blockTimestamp: desc}, {id: desc}], limit: $limit, offset: $offset) {
                ${PRODUCTION_FIELDS}
            }
        }`,
        { where: toWhere(filter), limit: limit + 1, offset },
    );

    return {
        records: data.ProductionBatch.slice(0, limit),
        hasMore: data.ProductionBatch.length > limit,
    };
}

//-- How many productions matching the filter landed after `afterSeconds`. Capped: the banner only
//-- needs to say "N new", and a long-idle tab should not pull a large page.
export async function countProductionsAfter(filter: ProductionFilter, afterSeconds: number): Promise<number> {
    const where = toWhere(filter);
    (where._and as Record<string, unknown>[]).push({ blockTimestamp: { _gt: String(afterSeconds) } });

    const data = await query<{ ProductionBatch: { id: string }[] }>(
        `query Newer($where: ProductionBatch_bool_exp!) {
            ProductionBatch(where: $where, limit: 100) { id }
        }`,
        { where },
    );

    return data.ProductionBatch.length;
}

export async function findProductionsByUuid(uuid: string): Promise<ProductionRecord[]> {
    const data = await query<{ ProductionBatch: ProductionRecord[] }>(
        `query ByUuid($chainId: Int!, $uuid: String!) {
            ProductionBatch(where: {chainId: {_eq: $chainId}, productionUuid: {_eq: $uuid}}, limit: 1) {
                ${PRODUCTION_FIELDS}
            }
        }`,
        { chainId: EXPLORER_CHAIN_ID, uuid: uuid.toLowerCase() },
    );

    return data.ProductionBatch;
}

export interface ExplorerStats {
    global: GlobalStatsRecord | null;
    //-- Oldest first, one entry per day of the window, zero-filled.
    daily: DailyStatsRecord[];
    //-- Producers with at least one production in the window.
    activeProducers: number;
    //-- Distinct products ever produced, registered on-chain or not.
    producedProducts: number;
}

export async function getStats(days: number): Promise<ExplorerStats> {
    const fromDay = today() - days + 1;

    const data = await query<{
        GlobalStats: GlobalStatsRecord[];
        DailyStats: DailyStatsRecord[];
        DailyEntityStats: { entity: string }[];
        ProductStats: { id: string }[];
    }>(
        `query Stats($chainId: Int!, $id: String!, $fromDay: Int!) {
            GlobalStats(where: {id: {_eq: $id}}) {
                productionCount producerCount productCount entityCount lastProductionAt
            }
            DailyStats(where: {chainId: {_eq: $chainId}, day: {_gte: $fromDay}}, order_by: {day: asc}) {
                day productionCount activeProducers newProducts newEntities
            }
            DailyEntityStats(where: {chainId: {_eq: $chainId}, day: {_gte: $fromDay}}) { entity }
            ProductStats(where: {chainId: {_eq: $chainId}}) { id }
        }`,
        { chainId: EXPLORER_CHAIN_ID, id: String(EXPLORER_CHAIN_ID), fromDay },
    );

    const byDay = new Map(data.DailyStats.map((record) => [record.day, record]));
    const daily: DailyStatsRecord[] = [];
    for (let day = fromDay; day <= today(); day++) {
        daily.push(
            byDay.get(day) ?? { day, productionCount: 0, activeProducers: 0, newProducts: 0, newEntities: 0 },
        );
    }

    return {
        global: data.GlobalStats[0] ?? null,
        daily,
        activeProducers: new Set(data.DailyEntityStats.map((record) => record.entity)).size,
        producedProducts: data.ProductStats.length,
    };
}

export type RankingWindow = "30d" | "all";

function rank(rows: { key: string; productionCount: number }[], limit: number): CountRecord[] {
    const totals = new Map<string, number>();
    for (const row of rows) {
        totals.set(row.key, (totals.get(row.key) ?? 0) + row.productionCount);
    }

    return [...totals.entries()]
        .map(([key, productionCount]) => ({ key, productionCount }))
        .sort((a, b) => b.productionCount - a.productionCount)
        .slice(0, limit);
}

//-- Top producers and products by number of productions. Quantities are not compared: every product
//-- counts in its own unit (bags, kg, bottles), so a sum across products means nothing.
export async function getRankings(
    window: RankingWindow,
    limit: number,
): Promise<{ producers: CountRecord[]; products: CountRecord[] }> {
    if (window === "all") {
        const data = await query<{
            EntityStats: { entity: string; productionCount: number }[];
            ProductStats: { productUuid: string; productionCount: number }[];
        }>(
            `query RankAll($chainId: Int!, $limit: Int!) {
                EntityStats(where: {chainId: {_eq: $chainId}}, order_by: {productionCount: desc}, limit: $limit) {
                    entity productionCount
                }
                ProductStats(where: {chainId: {_eq: $chainId}}, order_by: {productionCount: desc}, limit: $limit) {
                    productUuid productionCount
                }
            }`,
            { chainId: EXPLORER_CHAIN_ID, limit },
        );

        return {
            producers: data.EntityStats.map((row) => ({ key: row.entity, productionCount: row.productionCount })),
            products: data.ProductStats.map((row) => ({ key: row.productUuid, productionCount: row.productionCount })),
        };
    }

    const data = await query<{
        DailyEntityStats: { entity: string; productionCount: number }[];
        DailyProductStats: { productUuid: string; productionCount: number }[];
    }>(
        `query Rank30($chainId: Int!, $fromDay: Int!) {
            DailyEntityStats(where: {chainId: {_eq: $chainId}, day: {_gte: $fromDay}}) { entity productionCount }
            DailyProductStats(where: {chainId: {_eq: $chainId}, day: {_gte: $fromDay}}) { productUuid productionCount }
        }`,
        { chainId: EXPLORER_CHAIN_ID, fromDay: today() - 29 },
    );

    return {
        producers: rank(data.DailyEntityStats.map((row) => ({ key: row.entity, productionCount: row.productionCount })), limit),
        products: rank(
            data.DailyProductStats.map((row) => ({ key: row.productUuid, productionCount: row.productionCount })),
            limit,
        ),
    };
}

//-- Every producer and every produced product, for the filter menus. Small: one row per producer
//-- or product, not per production.
export async function getFilterOptions(): Promise<{ producers: string[]; products: { productUuid: string; entity?: string }[] }> {
    const data = await query<{
        EntityStats: { entity: string }[];
        ProductStats: { productUuid: string }[];
        ProductionBatch: { entity: string; productUuid: string }[];
    }>(
        `query Options($chainId: Int!) {
            EntityStats(where: {chainId: {_eq: $chainId}}, order_by: {productionCount: desc}) { entity }
            ProductStats(where: {chainId: {_eq: $chainId}}, order_by: {productionCount: desc}) { productUuid }
            ProductionBatch(where: {chainId: {_eq: $chainId}}, distinct_on: productUuid, order_by: {productUuid: asc}) {
                entity productUuid
            }
        }`,
        { chainId: EXPLORER_CHAIN_ID },
    );

    //-- A product's producer, to know whose peer to ask for its name.
    const producerOf = new Map(data.ProductionBatch.map((row) => [row.productUuid, row.entity]));

    return {
        producers: data.EntityStats.map((row) => row.entity),
        products: data.ProductStats.map((row) => ({ productUuid: row.productUuid, entity: producerOf.get(row.productUuid) })),
    };
}

export async function getEntities(addresses: string[]): Promise<EntityRecord[]> {
    if (!addresses.length) {
        return [];
    }

    const data = await query<{ Entity: EntityRecord[] }>(
        `query Entities($ids: [String!]!) {
            Entity(where: {id: {_in: $ids}}) { id name peerUrl }
        }`,
        { ids: addresses.map((address) => address.toLowerCase()) },
    );

    return data.Entity;
}

export async function getProducts(productUuids: string[]): Promise<ProductRecord[]> {
    if (!productUuids.length) {
        return [];
    }

    const data = await query<{ Product: ProductRecord[] }>(
        `query Products($chainId: Int!, $uuids: [String!]!) {
            Product(where: {chainId: {_eq: $chainId}, productUuid: {_in: $uuids}}) { productUuid name entity }
        }`,
        { chainId: EXPLORER_CHAIN_ID, uuids: productUuids },
    );

    return data.Product;
}
