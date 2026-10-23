import {Tlt} from "@clairejs/react";

import {useLookupUrl} from "../hooks/use-lookup-url";

//-- Where the backend's code resolver sends a visitor whose code matched more than one lot.
//--
//-- Entity short names are unique per tenant, not globally, so two companies may each hold one —
//-- and a typed code carries no tenant to choose between them. Guessing is the one thing a
//-- traceability product must not do: showing somebody another company's batch would be worse
//-- than showing them nothing.
//--
//-- Distinct from /not-found, which means no lot matched at all. Here the code is real, so the
//-- message says the problem is on our side and points at the one thing the visitor can act on:
//-- the full link, which carries the uuid and is never ambiguous.
export default function ErrorPage() {
  const lookupUrl = useLookupUrl();

  return (
    <div className="landing-page">
      <div className="state">
        <h1 className="h-3">
          <Tlt template="Batch Code Not Unique" />
        </h1>
        <p className="muted">
          <Tlt template="That code matches more than one batch, so we cannot tell which one you mean. Use the full batch link, or ask the producer for it." />
        </p>
        <a className="btn btn-primary btn-sm" href={lookupUrl}>
          <Tlt template="Look up another code" />
        </a>
      </div>
    </div>
  );
}
