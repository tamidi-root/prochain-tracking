import { Tlt } from "@clairejs/react";
import { useMemo } from "react";

import { ValueType } from "../types/tracking";
import { formatDate, formatDateTime } from "../utils/date";

interface Props {
    valueType?: ValueType;
    value?: string;
}

export function ValueTypeDisplay({ value, valueType = ValueType.text }: Props) {
    const listValue = useMemo(() => {
        if (!value) {
            return [];
        }

        try {
            return JSON.parse(value) as string[];
        } catch {
            return [];
        }
    }, [value]);

    if (valueType === ValueType.number) {
        return <span>{value ? Number(value).toLocaleString() : "---"}</span>;
    }

    if (valueType === ValueType.boolean) {
        return <span>{value === "true" ? <Tlt template="Yes" /> : <Tlt template="No" />}</span>;
    }

    if (valueType === ValueType.datestring) {
        return <span>{value ? formatDate(value) : "---"}</span>;
    }

    if (valueType === ValueType.timestamp) {
        return <span>{value ? formatDateTime(Number(value)) : "---"}</span>;
    }

    if (valueType === ValueType.list) {
        return (
            <div className="flex flex-wrap" style={{ gap: 8 }}>
                {listValue.map((item) => (
                    <span key={item} className="button compact" style={{ cursor: "default" }}>
                        {item}
                    </span>
                ))}
            </div>
        );
    }

    if (valueType === ValueType.media_urls) {
        return (
            <div className="flex flex-wrap" style={{ gap: 12 }}>
                {listValue.map((url) => (
                    <a key={url} href={url} rel="noreferrer" target="_blank">
                        <img
                            alt=""
                            src={url}
                            style={{
                                width: 76,
                                height: 76,
                                objectFit: "cover",
                                borderRadius: 12,
                                border: "1px solid var(--lp-glass-border)",
                            }}
                        />
                    </a>
                ))}
            </div>
        );
    }

    if (valueType === ValueType.attachment_urls) {
        const files = value ? (JSON.parse(value) as { url: string; name: string }[]) : [];
        return (
            <div className="flex flex-col" style={{ gap: 8 }}>
                {files.map((file) => (
                    <a key={file.url} href={file.url} rel="noreferrer" target="_blank">
                        {file.name}
                    </a>
                ))}
            </div>
        );
    }

    return <span>{value || "---"}</span>;
}
