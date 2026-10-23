import { Tlt } from "@clairejs/react";
import { RichText } from "../../components/rich-text";
import type { ProductObject } from "../../types/tracking";
import { isRichTextEmpty } from "../../utils/data";

import { Part } from "./shared";

interface Props {
    product: ProductObject;
}

export function ProductDescription({ product }: Props) {
    if (isRichTextEmpty(product.description)) {
        return null;
    }

    return (
        <Part label={<Tlt template="Description" />}>
            <div className="muted">
                <RichText value={product.description} />
            </div>
        </Part>
    );
}
