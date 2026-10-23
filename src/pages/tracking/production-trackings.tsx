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
import { Part } from "./shared";

interface ProofWithProduction {
    proof: ProductionDetailProofObject;
    sourceProduction?: ProductionObject;
}

function ProofRow({ item }: { item: ProofWithProduction }) {
    const label = item.sourceProduction?.readable_id || item.proof.source_production_id.slice(0, 8);

    return (
        <li>
            <span className="idx">#</span>
            <div className="flex flex-row items-center justify-between" style={{ gap: 12 }}>
                <div>
                    <p className="mono">{label}</p>
                    <p className="faint small">
                        <Tlt template="Amount" /> {item.proof.amount.toLocaleString()}
                    </p>
                </div>
                <Link className="button compact" to={getTrackingPath(item.proof.source_production_id)}>
                    <Tlt template="Open batch" />
                    <ExternalLink size={14} />
                </Link>
            </div>
        </li>
    );
}

function TrackingIngredient({
    index,
    product,
    entity,
    amount,
    proofItems,
}: {
    index: number;
    product: ProductObject;
    entity: EntityObject;
    amount?: number;
    proofItems: ProofWithProduction[];
}) {
    const [showProofs, setShowProofs] = useState(false);

    return (
        <li>
            <span className="idx">{String(index + 1).padStart(2, "0")}</span>
            <div className="flex flex-row items-start" style={{ gap: 16 }}>
                <div className="ing-thumb">
                    <ImageWithFallback uri={product.photo_url} width={48} />
                </div>
                <div className="flex-1">
                    <h3 className="h-4">{product.name}</h3>
                    {amount != null && (
                        <p className="muted">
                            <Tlt template="Amount" /> <span className="num">{amount.toLocaleString()}</span>
                            {product.unit ? ` ${product.unit}` : ""}
                        </p>
                    )}
                    {!!entity.name && (
                        <p className="faint small">
                            <Tlt template="From" /> {entity.name}
                        </p>
                    )}
                </div>
                {proofItems.length > 0 && (
                    <button className="button compact" onClick={() => setShowProofs(true)} type="button">
                        <ShieldCheck size={14} />
                        <Tlt template="Proof" />
                    </button>
                )}
            </div>
            <Modal
                visible={showProofs}
                onClose={() => setShowProofs(false)}
                title={getText(<Tlt template="Ingredient proof" />)}
                width={460}>
                <p className="muted small">
                    {product.name} · {proofItems.length} <Tlt template="source batches" />
                </p>
                <ul className="rows" style={{ marginTop: 12 }}>
                    {proofItems.map((item) => (
                        <ProofRow key={item.proof.uuid} item={item} />
                    ))}
                </ul>
            </Modal>
        </li>
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
        return (
            <Part label={<Tlt template="Ingredients" />}>
                <LoadingOrError items={details} />
            </Part>
        );
    }

    if (!details.ingredients?.length) {
        return null;
    }

    return (
        <Part label={<Tlt template="Ingredients" />}>
            {details.ingredients.map((ingredient) => {
                const productionDetails = details.productionDetails?.filter((detail) => detail.ingredient_id === ingredient.uuid);
                let index = 0;

                return (
                    <div key={ingredient.uuid} className="ing-group">
                        <p className="faint small sub-title">{capitalize(ingredient.name)}</p>
                        <ul className="rows">
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
                                        index={index++}
                                        amount={detail.amount}
                                        entity={entity}
                                        product={product}
                                        proofItems={proofItems}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </Part>
    );
}
