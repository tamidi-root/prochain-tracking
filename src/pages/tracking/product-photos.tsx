import { ImageWithFallback } from "../../components/image-with-fallback";
import type { ProductObject } from "../../types/tracking";

interface Props {
    product: ProductObject;
}

export function TrackingPhotos({ product }: Props) {
    return (
        <div className="img">
            <ImageWithFallback uri={product.photo_url} width={480} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
    );
}
