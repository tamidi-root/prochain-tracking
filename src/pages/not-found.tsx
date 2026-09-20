import {Tlt} from "@clairejs/react";

//-- Where the backend's code resolver sends a visitor whose code matched no lot.
//--
//-- The redirect endpoint cannot render anything itself, and bouncing someone to a raw API error
//-- would end the journey on an unbranded JSON page. It also deliberately does not say whether the
//-- entity exists and only the lot was wrong: a code that is simply "not found" gives an
//-- enumerating caller nothing back.
//--
//-- Distinct from the empty state at /p, which reads "Tracking ID required" — that is the message
//-- for arriving with no code at all, not for one that did not resolve.
export default function NotFoundPage() {
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
            <Tlt template="Batch Code Not Found" />
          </span>
          <span
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            <Tlt template="No batch matches that code. Check it against the label and try again." />
          </span>
        </div>
      </div>
    </div>
  );
}
