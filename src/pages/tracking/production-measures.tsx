import { Tlt } from "@clairejs/react";
import { ValueTypeDisplay } from "../../components/value-type-display";
import type { ProductionTrackingObject, ProductPropertyObject } from "../../types/tracking";
import { ValueType } from "../../types/tracking";
import { capitalize } from "../../utils/data";

import { Part } from "./shared";

interface Props {
    properties: ProductPropertyObject[];
    trackings: ProductionTrackingObject[];
}

export function TrackingMeasures({ properties, trackings }: Props) {
    if (!properties.length) {
        return null;
    }

    const sorted = [...properties].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

    return (
        <Part label={<Tlt template="Quality measures" />}>
            <table className="table">
                <thead>
                    <tr>
                        <th>
                            <Tlt template="Measure" />
                        </th>
                        <th>
                            <Tlt template="Result" />
                        </th>
                        <th>
                            <Tlt template="Standard" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((property) => {
                        const tracking = trackings.find((item) => item.property_id === property.uuid);
                        const valueType = property.value_type || ValueType.text;

                        return (
                            <tr key={property.uuid}>
                                <td>{capitalize(property.name)}</td>
                                <td className={valueType === ValueType.number ? "num" : undefined}>
                                    <ValueTypeDisplay value={tracking?.value || ""} valueType={valueType} />
                                </td>
                                <td className="muted">{property.standard || "—"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Part>
    );
}
