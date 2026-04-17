import { Tlt } from "@clairejs/react";
import { ValueTypeDisplay } from "../../components/value-type-display";
import { useBreakpoints } from "../../hooks/use-breakpoints";
import type { ProductionTrackingObject, ProductPropertyObject } from "../../types/tracking";
import { ValueType } from "../../types/tracking";
import { capitalize } from "../../utils/data";

interface Props {
    properties: ProductPropertyObject[];
    trackings: ProductionTrackingObject[];
}

export function TrackingMeasures({ properties, trackings }: Props) {
    const { mini } = useBreakpoints();

    if (!properties.length) {
        return null;
    }

    const sorted = [...properties].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

    return (
        <div className="flex flex-col" style={{ gap: 16 }}>
            <span className="font-bold" style={{ fontSize: 20, color: "var(--lp-text-heading)" }}>
                <Tlt template="Quality measures" />
            </span>
            <div
                className="flex flex-col"
                style={{
                    borderRadius: 16,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                    overflow: "hidden",
                }}>
                {sorted.map((property, index) => {
                    const tracking = trackings.find((item) => item.property_id === property.uuid);

                    return (
                        <div
                            key={property.uuid}
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
                                {capitalize(property.name)}
                            </span>
                            <div className="flex-1" style={{ color: "var(--lp-text)", paddingBlock: mini ? 0 : 7 }}>
                                <ValueTypeDisplay
                                    value={tracking?.value || property.standard || ""}
                                    valueType={property.value_type || ValueType.text}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
