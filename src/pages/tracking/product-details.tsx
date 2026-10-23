import { Tlt } from "@clairejs/react";
import { ValueTypeDisplay } from "../../components/value-type-display";
import type { ProductDetailObject } from "../../types/tracking";
import { capitalize } from "../../utils/data";

import { LoadingOrError } from "./loading-or-error";
import { Part } from "./shared";

export function ProductDetails({ details }: { details?: ProductDetailObject[] | null }) {
    if (!details) {
        return (
            <Part label={<Tlt template="Product details" />}>
                <LoadingOrError items={details} />
            </Part>
        );
    }

    if (!details.length) {
        return null;
    }

    const sorted = [...details].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

    return (
        <Part label={<Tlt template="Product details" />}>
            <dl className="kv">
                {sorted.map((detail) => (
                    <div key={detail.uuid}>
                        <dt>{capitalize(detail.name)}</dt>
                        <dd>
                            <ValueTypeDisplay value={detail.value} valueType={detail.value_type} />
                        </dd>
                    </div>
                ))}
            </dl>
        </Part>
    );
}
