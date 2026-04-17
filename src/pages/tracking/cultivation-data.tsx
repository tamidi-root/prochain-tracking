import { Tlt } from "@clairejs/react";
import type { CultivationData as CultivationDataValue } from "../../types/tracking";
import { formatDate } from "../../utils/date";

interface Props {
    data: CultivationDataValue;
}

function InfoRow({ label, value }: { label: React.ReactNode; value?: string | number }) {
    if (!value && value !== 0) {
        return null;
    }

    return (
        <div className="flex flex-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--lp-text-muted)" }}>{label}</span>
            <span style={{ fontSize: 13, color: "var(--lp-text-heading)", fontWeight: 500 }}>{value}</span>
        </div>
    );
}

export function CultivationData({ data }: Props) {
    if (!data?.cropSeason) {
        return null;
    }

    const { cropSeason, species, land, inputsUsed } = data;

    return (
        <div className="flex flex-col" style={{ gap: 16 }}>
            <span className="font-semibold" style={{ fontSize: 16, color: "var(--lp-text-heading)" }}>
                <Tlt template="Cultivation Origin" />
            </span>

            {species && (
                <div
                    className="flex flex-col"
                    style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        gap: 6,
                    }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-text-heading)", paddingBottom: 4 }}>
                        <Tlt template="Species" />
                    </span>
                    <InfoRow label={<Tlt template="Name" />} value={species.name} />
                    <InfoRow label={<Tlt template="Harvest unit" />} value={species.harvest_unit} />
                </div>
            )}

            <div
                className="flex flex-col"
                style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "var(--lp-glass-bg)",
                    border: "1px solid var(--lp-glass-border)",
                    gap: 6,
                }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-text-heading)" }}>
                    <Tlt template="Crop Season" />
                </span>
                <InfoRow label={<Tlt template="Period" />} value={`${formatDate(cropSeason.from_date)} — ${formatDate(cropSeason.to_date)}`} />
                <InfoRow label={<Tlt template="Density" />} value={cropSeason.density} />
            </div>

            {land && (
                <div
                    className="flex flex-col"
                    style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        gap: 6,
                    }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-text-heading)", paddingBottom: 4 }}>
                        <Tlt template="Land" />
                    </span>
                    <InfoRow label={<Tlt template="Name" />} value={land.name} />
                    <InfoRow label={<Tlt template="Area (m²)" />} value={land.area != null ? land.area.toLocaleString() : undefined} />
                    <InfoRow label={<Tlt template="Soil Type" />} value={land.type_of_soil} />
                    <InfoRow label={<Tlt template="Water Source" />} value={land.type_of_water} />
                    <InfoRow label={<Tlt template="Soil Condition" />} value={land.state_of_soil} />
                    <InfoRow label={<Tlt template="Water Condition" />} value={land.state_of_water} />
                    <InfoRow label={<Tlt template="Elevation (m)" />} value={land.sea_level} />
                    <InfoRow label={<Tlt template="Slope (degrees)" />} value={land.slope} />
                </div>
            )}

            {!!inputsUsed?.length && (
                <div
                    className="flex flex-col"
                    style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        gap: 6,
                    }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-text-heading)", paddingBottom: 4 }}>
                        <Tlt template="Inputs Used" />
                    </span>
                    {inputsUsed.map((input, index) => (
                        <InfoRow
                            key={`${input.name}-${index}`}
                            label={input.name}
                            value={`${input.totalAmount.toLocaleString()}${input.unit ? ` ${input.unit}` : ""}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
