import { Tlt } from "@clairejs/react";
import { Spinner } from "../../components/spinner";

interface Props<T> {
    items?: T | null;
}

export function LoadingOrError<T>({ items }: Props<T>) {
    return items === undefined ? (
        <Spinner size={28} />
    ) : (
        <p className="faint small">
            <Tlt template="Cannot read from server" />
        </p>
    );
}
