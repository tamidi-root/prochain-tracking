import { Tlt } from "@clairejs/react";
import { RichText } from "../../components/rich-text";
import type { ProductObject } from "../../types/tracking";
import { isRichTextEmpty } from "../../utils/data";

interface Props {
    product: ProductObject;
}

export function ProductDescription({ product }: Props) {
    if (isRichTextEmpty(product.description)) {
        return null;
    }

    return (
        <div className="flex flex-col" style={{ gap: 12 }}>
            <span className="font-medium" style={{ fontSize: 15, color: "var(--lp-text-heading)" }}>
                <Tlt template="Description" />
            </span>
            <div
                style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                }}>
                <RichText value={product.description} />
            </div>
        </div>
    );
}
