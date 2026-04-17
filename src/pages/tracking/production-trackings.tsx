import { getText, Tlt } from "@clairejs/react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "@clairejs/react-web";

import { ImageWithFallback } from "../../components/image-with-fallback";
import { Modal } from "../../components/modal";
import type {
    EntityObject,
    GetPublicProductionResponseBody,
    ProductionDetailProofObject,
    ProductionObject,
    ProductObject,
} from "../../types/tracking";
import { capitalize } from "../../utils/data";
import { getTrackingPath } from "../../utils/routing";

import { LoadingOrError } from "./loading-or-error";

interface ProofWithProduction {
    proof: ProductionDetailProofObject;
    sourceProduction?: ProductionObject;
}

function ProofRow({ item }: { item: ProofWithProduction }) {
    const label = item.sourceProduction?.readable_id || item.proof.source_production_id.slice(0, 8);

    return (
        <div
            className="flex flex-row items-center justify-between"
            style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "var(--lp-glass-bg)",
                border: "1px solid var(--lp-glass-border)",
                gap: 12,
            }}>
            <div className="flex flex-col" style={{ gap: 2 }}>
                <span className="font-medium" style={{ fontSize: 13, fontFamily: "monospace", color: "var(--lp-text)" }}>
                    #{label}
                </span>
                <span style={{ fontSize: 12, color: "var(--lp-text-muted)" }}>
                    Amount: {item.proof.amount.toLocaleString()}
                </span>
            </div>
            <Link className="button compact" to={getTrackingPath(item.proof.source_production_id)}>
                <ExternalLink size={14} />
            </Link>
        </div>
    );
}

function TrackingIngredient({
    product,
    entity,
    amount,
    proofItems,
}: {
    product: ProductObject;
    entity: EntityObject;
    amount?: number;
    proofItems: ProofWithProduction[];
}) {
    const [showProofs, setShowProofs] = useState(false);

    return (
        <>
            <div
                className="flex flex-row items-center"
                style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                    gap: 12,
                }}>
                <div style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0, backgroundColor: "#ffffff" }}>
                    <ImageWithFallback uri={product.photo_url} width={40} />
                </div>
                <div className="flex flex-col flex-1" style={{ gap: 2 }}>
                    <span className="font-medium" style={{ fontSize: 14, color: "var(--lp-text)" }}>
                        {product.name}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--lp-text-muted)" }}>From: {entity.name}</span>
                </div>
                {amount != null && (
                    <span className="font-medium" style={{ fontSize: 14, color: "var(--lp-text)" }}>
                        {amount.toLocaleString()}
                    </span>
                )}
                {proofItems.length > 0 && (
                    <button className="button compact" onClick={() => setShowProofs(true)} type="button">
                        <ShieldCheck size={14} />
                        <Tlt template="Proof" />
                    </button>
                )}
            </div>
            <Modal visible={showProofs} onClose={() => setShowProofs(false)} title={getText(<Tlt template="Ingredient proof" />)} width={460}>
                <div className="flex flex-col" style={{ gap: 12 }}>
                    <div className="flex flex-row items-center" style={{ gap: 12 }}>
                        <div style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0, backgroundColor: "#ffffff" }}>
                            <ImageWithFallback uri={product.photo_url} width={36} />
                        </div>
                        <div className="flex flex-col" style={{ gap: 2 }}>
                            <span className="font-medium" style={{ fontSize: 14, color: "var(--lp-text)" }}>
                                {product.name}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--lp-text-muted)" }}>
                                {proofItems.length} <Tlt template="source batches" />
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col" style={{ gap: 8 }}>
                        {proofItems.map((item) => (
                            <ProofRow key={item.proof.uuid} item={item} />
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
}

interface Props {
    details?: Partial<
        Pick<
            GetPublicProductionResponseBody,
            "ingredients" | "productionDetails" | "productionDetailProofs" | "relatedProducts" | "relatedEntities" | "sourceProductions"
        >
    > | null;
}

export function TrackingIngredients({ details }: Props) {
    if (!details) {
        return <LoadingOrError items={details} />;
    }

    if (!details.ingredients?.length) {
        return null;
    }

    return (
        <div className="flex flex-col" style={{ gap: 16 }}>
            <span className="font-bold" style={{ fontSize: 20, color: "var(--lp-text-heading)" }}>
                <Tlt template="Ingredients" />
            </span>
            <div className="flex flex-col" style={{ gap: 12 }}>
                {details.ingredients.map((ingredient) => {
                    const productionDetails = details.productionDetails?.filter((detail) => detail.ingredient_id === ingredient.uuid);

                    return (
                        <div key={ingredient.uuid} className="flex flex-col" style={{ gap: 8 }}>
                            <span className="font-medium" style={{ fontSize: 13, color: "var(--lp-text-muted)" }}>
                                {capitalize(ingredient.name)}
                            </span>
                            <div className="flex flex-col" style={{ gap: 8 }}>
                                {productionDetails?.map((detail) => {
                                    const product = details.relatedProducts?.find((item) => item.uuid === detail.product_id);
                                    if (!product) {
                                        return null;
                                    }

                                    const entity = details.relatedEntities?.find((item) => item.uuid === product.entity_id);
                                    if (!entity) {
                                        return null;
                                    }

                                    const proofs = details.productionDetailProofs?.filter(
                                        (item) => item.production_detail === detail.uuid,
                                    ) || [];

                                    const proofItems: ProofWithProduction[] = proofs.map((proof) => ({
                                        proof,
                                        sourceProduction: details.sourceProductions?.find(
                                            (item) => item.uuid === proof.source_production_id,
                                        ),
                                    }));

                                    return (
                                        <TrackingIngredient
                                            key={detail.uuid}
                                            amount={detail.amount}
                                            entity={entity}
                                            product={product}
                                            proofItems={proofItems}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
