import { ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";

const scaledSizes = [16, 32, 64, 128, 256, 512, 1024, 2048];

interface Props {
    uri?: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
}

export function ImageWithFallback({ uri, width, height, style }: Props) {
    const [imgError, setImgError] = useState(false);
    const scaledWidth = !width || uri?.startsWith("blob:") ? undefined : scaledSizes.find((size) => size > width * 2);
    const scaledHeight = !height || uri?.startsWith("blob:") ? undefined : scaledSizes.find((size) => size > height * 2);

    const scaledUri = useMemo(() => {
        if ((!scaledWidth && !scaledHeight) || !uri) {
            return uri;
        }

        const url = new URL(uri);
        if (scaledWidth) {
            url.searchParams.set("width", scaledWidth.toString());
        }
        if (scaledHeight) {
            url.searchParams.set("height", scaledHeight.toString());
        }
        return url.toString();
    }, [scaledHeight, scaledWidth, uri]);

    const boxStyle: React.CSSProperties = {
        width,
        height: height ?? width,
        ...style,
    };

    if (!scaledUri || imgError) {
        return (
            <div
                className="flex items-center justify-center"
                style={{
                    ...boxStyle,
                    background: "rgba(127, 127, 127, 0.12)",
                    color: "var(--lp-text-muted)",
                }}>
                <ImageIcon size={Math.max(16, Math.floor((width || 40) / 2.5))} />
            </div>
        );
    }

    return (
        <img
            alt=""
            src={scaledUri}
            onError={() => setImgError(true)}
            style={{
                objectFit: "cover",
                ...boxStyle,
            }}
        />
    );
}
