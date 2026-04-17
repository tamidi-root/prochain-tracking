import { Tlt } from "@clairejs/react";
import { Spinner } from "../../components/spinner";

interface Props<T> {
    items?: T | null;
}

export function LoadingOrError<T>({ items }: Props<T>) {
    return (
        <div className="flex flex-row items-center justify-center" style={{ padding: 21, gap: 13 }}>
            {items === undefined ? (
                <Spinner size={40} />
            ) : (
                <span style={{ color: "var(--lp-text-muted)", fontSize: 13 }}>
                    <Tlt template="Cannot read from server" />
                </span>
            )}
        </div>
    );
}
