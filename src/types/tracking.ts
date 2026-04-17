export enum ValueType {
    text = "text",
    multiline = "multiline",
    number = "number",
    boolean = "boolean",
    datestring = "datestring",
    timestamp = "timestamp",
    list = "list",
    media_urls = "media_urls",
    attachment_urls = "attachment_urls",
}

export interface EntityObject {
    uuid: string;
    version?: number;
    name: string;
    description?: string;
    address?: string;
    photo_url?: string;
    banner_image?: string;
    peer_url?: string;
    external_links?: { name: string; url: string }[];
    on_chain?: boolean;
}

export interface EntityProfileObject extends EntityObject {
    featured_products_expanded?: ProductObject[];
}

export interface ProductObject {
    uuid: string;
    version?: number;
    entity_id: string;
    name: string;
    description?: string;
    unit?: string;
    photo_url?: string;
    on_chain?: boolean;
}

export interface ProductionObject {
    uuid: string;
    version?: number;
    entity_id: string;
    product_id: string;
    quantity?: number;
    readable_id?: string;
    expiration_date?: number;
    on_chain?: boolean;
}

export interface ProductDetailObject {
    uuid: string;
    product_id: string;
    name: string;
    value_type?: ValueType;
    value?: string;
    order?: number;
}

export interface EntityDetailObject {
    uuid: string;
    entity: string;
    name: string;
    value?: string;
    value_type?: ValueType;
    order?: number;
}

export interface ProductPropertyObject {
    uuid: string;
    product_id: string;
    name: string;
    standard?: string;
    value_type?: ValueType;
    order?: number;
}

export interface ProductIngredientObject {
    uuid: string;
    name: string;
}

export interface ProductionDetailObject {
    uuid: string;
    production_id: string;
    ingredient_id?: string;
    product_id: string;
    amount?: number;
}

export interface ProductionTrackingObject {
    uuid: string;
    production_id: string;
    property_id: string;
    value?: string;
}

export interface ProductionDetailProofObject {
    uuid: string;
    production_detail: string;
    source_production_id: string;
    amount: number;
}

export interface CultivationData {
    cropSeason?: {
        from_date: number;
        to_date: number;
        density?: string;
    };
    species?: {
        name: string;
        harvest_unit?: string;
    };
    land?: {
        name: string;
        area?: number;
        sea_level?: number;
        slope?: number;
        type_of_soil?: string;
        type_of_water?: string;
        state_of_soil?: string;
        state_of_water?: string;
    };
    inputsUsed?: {
        name: string;
        totalAmount: number;
        unit?: string;
    }[];
}

export interface GetPublicProductionResponseBody {
    production: ProductionObject;
    productionDetails: ProductionDetailObject[];
    trackingDetails: ProductionTrackingObject[];
    productProperties: ProductPropertyObject[];
    productDetails: ProductDetailObject[];
    ingredients: ProductIngredientObject[];
    productionDetailProofs: ProductionDetailProofObject[];
    relatedProducts: ProductObject[];
    relatedEntities: EntityObject[];
    sourceProductions: ProductionObject[];
    cultivationData?: CultivationData;
}
