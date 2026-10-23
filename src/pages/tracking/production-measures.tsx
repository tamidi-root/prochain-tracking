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
                                {/*-- The standard is stored in the property's own value format (a JSON file list for
                                      attachments, a JSON array for lists), so it renders the same way as the result. */}
                                <td className="muted">
                                    {property.standard ? (
                                        <ValueTypeDisplay value={property.standard} valueType={valueType} />
                                    ) : (
                                        "—"
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Part>
    );
}
