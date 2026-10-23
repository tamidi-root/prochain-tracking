import { Tlt } from "@clairejs/react";
import type { ReactNode } from "react";

import type { CultivationData as CultivationDataValue } from "../../types/tracking";
import { formatDate } from "../../utils/date";

import { Part } from "./shared";

interface Props {
    data: CultivationDataValue;
}

function InfoRow({ label, value }: { label: ReactNode; value?: string | number }) {
    if (!value && value !== 0) {
        return null;
    }

    return (
        <div>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

export function CultivationData({ data }: Props) {
    if (!data?.cropSeason) {
        return null;
    }

    const { cropSeason, species, land, inputsUsed } = data;

    return (
        <Part label={<Tlt template="Cultivation Origin" />}>
            <p className="faint small sub-title">
                <Tlt template="Crop Season" />
            </p>
            <dl className="kv">
                <InfoRow label={<Tlt template="Species" />} value={species?.name} />
                <InfoRow
                    label={<Tlt template="Period" />}
                    value={`${formatDate(cropSeason.from_date)} — ${formatDate(cropSeason.to_date)}`}
                />
                <InfoRow label={<Tlt template="Density" />} value={cropSeason.density} />
                <InfoRow label={<Tlt template="Harvest unit" />} value={species?.harvest_unit} />
            </dl>

            {land && (
                <>
                    <p className="faint small sub-title">
                        <Tlt template="Land" />
                    </p>
                    <dl className="kv">
                        <InfoRow label={<Tlt template="Name" />} value={land.name} />
                        <InfoRow
                            label={<Tlt template="Area (m²)" />}
                            value={land.area != null ? land.area.toLocaleString() : undefined}
                        />
                        <InfoRow label={<Tlt template="Soil Type" />} value={land.type_of_soil} />
                        <InfoRow label={<Tlt template="Water Source" />} value={land.type_of_water} />
                        <InfoRow label={<Tlt template="Soil Condition" />} value={land.state_of_soil} />
                        <InfoRow label={<Tlt template="Water Condition" />} value={land.state_of_water} />
                        <InfoRow label={<Tlt template="Elevation (m)" />} value={land.sea_level} />
                        <InfoRow label={<Tlt template="Slope (degrees)" />} value={land.slope} />
                    </dl>
                </>
            )}

            {!!inputsUsed?.length && (
                <>
                    <p className="faint small sub-title">
                        <Tlt template="Inputs Used" />
                    </p>
                    <dl className="kv">
                        {inputsUsed.map((input, index) => (
                            <InfoRow
                                key={`${input.name}-${index}`}
                                label={input.name}
                                value={`${input.totalAmount.toLocaleString()}${input.unit ? ` ${input.unit}` : ""}`}
                            />
                        ))}
                    </dl>
                </>
            )}
        </Part>
    );
}
