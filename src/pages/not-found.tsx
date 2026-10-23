import {Tlt} from "@clairejs/react";

import {useLookupUrl} from "../hooks/use-lookup-url";

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
  const lookupUrl = useLookupUrl();

  return (
    <div className="landing-page">
      <div className="state">
        <h1 className="h-3">
          <Tlt template="Batch Code Not Found" />
        </h1>
        <p className="muted">
          <Tlt template="No batch matches that code." />
        </p>
        <a className="btn btn-primary btn-sm" href={lookupUrl}>
          <Tlt template="Look up another code" />
        </a>
      </div>
    </div>
  );
}
