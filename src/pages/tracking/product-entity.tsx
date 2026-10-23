import { Tlt } from "@clairejs/react";
import { Link } from "@clairejs/react-web";

import { ImageWithFallback } from "../../components/image-with-fallback";
import type { EntityObject } from "../../types/tracking";
import { getEntityPath } from "../../utils/routing";
import { shortAddress } from "../../utils/data";

import { Part } from "./shared";

export function TrackingEntity({ entity, producerAddress }: { entity: EntityObject; producerAddress?: string }) {
    return (
        <Part label={<Tlt template="Producer" />}>
            <Link className="producer" to={getEntityPath(entity.uuid)}>
                <ImageWithFallback uri={entity.photo_url} width={56} />
                <div>
                    <h2 className="h-3">{entity.name}</h2>
                    {!!entity.address && (
                        <p className="muted" style={{ marginTop: 6 }}>
                            {entity.address}
                        </p>
                    )}
                    {!!producerAddress && (
                        <p className="mono faint" style={{ marginTop: 6 }}>
                            Entity {shortAddress(producerAddress)}
                        </p>
                    )}
                </div>
            </Link>
        </Part>
    );
}
