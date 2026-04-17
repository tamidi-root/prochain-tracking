import { Tlt } from "@clairejs/react";
import { ValueTypeDisplay } from "../../components/value-type-display";
import { useBreakpoints } from "../../hooks/use-breakpoints";
import type { ProductDetailObject } from "../../types/tracking";
import { capitalize } from "../../utils/data";

import { LoadingOrError } from "./loading-or-error";

export function ProductDetails({ details }: { details?: ProductDetailObject[] | null }) {
    const { mini } = useBreakpoints();

    if (!details) {
        return <LoadingOrError items={details} />;
    }

    if (!details.length) {
        return null;
    }

    const sorted = [...details].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

    return (
        <div className="flex flex-col" style={{ gap: 16 }}>
            <span className="font-bold" style={{ fontSize: 20, color: "var(--lp-text-heading)" }}>
                <Tlt template="Product details" />
            </span>
            <div
                className="flex flex-col"
                style={{
                    borderRadius: 16,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                    overflow: "hidden",
                }}>
                {sorted.map((detail, index) => (
                    <div
                        key={detail.uuid}
                        className={`flex ${mini ? "flex-col" : "flex-row"} items-start`}
                        style={{
                            gap: mini ? 4 : 13,
                            padding: mini ? "14px 20px" : "14px 24px",
                            ...(index > 0 && { borderTop: "1px solid var(--lp-glass-border)" }),
                        }}>
                        <span
                            className="font-medium"
                            style={{
                                fontSize: 13,
                                paddingBlock: mini ? 0 : 7,
                                minWidth: mini ? 0 : 160,
                                color: "var(--lp-text-muted)",
                            }}>
                            {capitalize(detail.name)}
                        </span>
                        <div className="flex-1" style={{ color: "var(--lp-text)", paddingBlock: mini ? 0 : 7 }}>
                            <ValueTypeDisplay value={detail.value} valueType={detail.value_type} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
