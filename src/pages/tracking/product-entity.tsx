import { Tlt } from "@clairejs/react";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { Link } from "@clairejs/react-web";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { useBreakpoints } from "../../hooks/use-breakpoints";
import type { EntityObject, ProductObject } from "../../types/tracking";
import { getEntityPath } from "../../utils/routing";

export function TrackingEntity({ entity }: { entity: EntityObject }) {
    const { mini } = useBreakpoints();

    return (
        <Link
            className="flex flex-row items-center cursor-pointer"
            to={getEntityPath(entity.uuid)}
            style={{
                padding: mini ? 12 : 16,
                borderRadius: 16,
                background: "var(--lp-glass-bg)",
                border: "1px solid var(--lp-glass-border)",
                gap: 16,
                transition: "border-color 0.3s, box-shadow 0.3s",
                textDecoration: "none",
            }}>
            <ImageWithFallback
                uri={entity.photo_url}
                style={{ borderRadius: 12, flexShrink: 0 }}
                width={55}
            />
            <div className="flex flex-col flex-1" style={{ gap: 4 }}>
                <div className="flex flex-row items-center" style={{ gap: 8 }}>
                    <span className="font-medium" style={{ fontSize: mini ? 14 : 16, color: "var(--lp-text-heading)" }}>
                        {entity.name}
                    </span>
                    {entity.on_chain && <BadgeCheck size={16} style={{ color: "var(--lp-brand)", flexShrink: 0 }} />}
                </div>
                {!!entity.address && (
                    <span style={{ fontSize: 13, color: "var(--lp-text-muted)" }}>{entity.address}</span>
                )}
            </div>
            <ChevronRight size={18} style={{ color: "var(--lp-text-muted)", flexShrink: 0 }} />
        </Link>
    );
}

interface TrackingNameProps {
    product: ProductObject;
}

export function TrackingName({ product }: TrackingNameProps) {
    return (
        <div className="flex flex-col" style={{ gap: 4 }}>
            <span
                className="font-bold"
                style={{
                    fontSize: 28,
                    lineHeight: 1.2,
                    background: "linear-gradient(135deg, var(--lp-text-heading) 30%, var(--lp-brand-secondary) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                {product.name}
            </span>
            <span style={{ fontSize: 13, color: "var(--lp-text-muted)" }}><Tlt template="Production batch" /></span>
        </div>
    );
}
