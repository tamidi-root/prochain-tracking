import {Tlt} from "@clairejs/react";

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
  return (
    <div className="landing-page" style={{width: "100%"}}>
      <div
        className="landing-page-content"
        style={{minHeight: "100vh", justifyContent: "center"}}
      >
        <div
          className="flex flex-col items-center justify-center"
          style={{gap: 21, padding: 24}}
        >
          <span
            className="font-bold"
            style={{fontSize: 24, color: "var(--lp-text-heading)"}}
          >
            <Tlt template="Batch Code Not Unique" />
          </span>
          <span
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            <Tlt template="That code matches more than one batch, so we cannot tell which one you mean. Use the full batch link, or ask the producer for it." />
          </span>
        </div>
      </div>
    </div>
  );
}
