import { Tlt } from "@clairejs/react";

import { config } from "../../config/config";
import { shortAddress } from "../../utils/data";
import { formatDateTime } from "../../utils/date";

import { Part } from "./shared";

interface Props {
    productionId: string;
    producerAddress?: string;
    producedAt?: number | null;
}

//-- What the page read from the Production contract's batchInfo(), with links a visitor can follow to
//-- check it themselves on the block explorer.
export function OnChainProof({ productionId, producerAddress, producedAt }: Props) {
    const explorer = config.BLOCK_EXPLORER_URL;

    return (
        <Part label={<Tlt template="On-chain proof" />}>
            <dl className="kv">
                <div>
                    <dt>
                        <Tlt template="Batch ID" />
                    </dt>
                    <dd className="mono">{productionId}</dd>
                </div>
                {!!producedAt && (
                    <div>
                        <dt>
                            <Tlt template="Anchored at" />
                        </dt>
                        <dd className="mono">{formatDateTime(producedAt)}</dd>
                    </div>
                )}
                {!!producerAddress && (
                    <div>
                        <dt>
                            <Tlt template="Producer" />
                        </dt>
                        <dd className="mono">
                            <a href={`${explorer}/address/${producerAddress}`} target="_blank" rel="noopener">
                                Entity {shortAddress(producerAddress)} ↗
                            </a>
                        </dd>
                    </div>
                )}
                <div>
                    <dt>
                        <Tlt template="Contract" />
                    </dt>
                    <dd className="mono">
                        <a
                            href={`${explorer}/address/${config.PRODUCTION_CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noopener">
                            Production {shortAddress(config.PRODUCTION_CONTRACT_ADDRESS)} ↗
                        </a>
                    </dd>
                </div>
            </dl>
        </Part>
    );
}
