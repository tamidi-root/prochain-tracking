import { ImageWithFallback } from "../../components/image-with-fallback";
import { useBreakpoints } from "../../hooks/use-breakpoints";
import type { ProductionObject, ProductObject } from "../../types/tracking";

interface Props {
    product: ProductObject;
    production?: ProductionObject;
}

export function TrackingPhotos({ product, production }: Props) {
    const { mini } = useBreakpoints();

    return (
        <div
            style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                background: "var(--lp-glass-bg)",
                border: "1px solid var(--lp-glass-border)",
            }}>
            <div
                className="flex items-center justify-center"
                style={{
                    backgroundColor: "#ffffff",
                    overflow: "hidden",
                    ...(mini ? { width: "100%", aspectRatio: "1" } : { padding: 24 }),
                }}>
                <ImageWithFallback
                    uri={product.photo_url}
                    style={{
                        objectFit: mini ? "cover" : "contain",
                        ...(mini
                            ? { width: "100%", height: "100%" }
                            : { maxWidth: "100%", maxHeight: 400 }),
                    }}
                    width={mini ? undefined : 400}
                    height={mini ? undefined : 400}
                />
            </div>
            {production && (
                <div
                    className="flex flex-row items-center"
                    style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(8px)",
                        paddingBlock: 4,
                        paddingInline: 12,
                        borderRadius: 100,
                    }}>
                    <span className="font-medium" style={{ fontSize: 13, color: "#fff" }}>
                        Lot: {production.readable_id || production.uuid}
                    </span>
                </div>
            )}
        </div>
    );
}
