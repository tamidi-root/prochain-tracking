import { useLanguage } from "@clairejs/react";

import { config } from "../config/config";

//-- The site's lookup page in the visitor's language: /tra-cuu for Vietnamese, /en/verify otherwise.
export const useLookupUrl = () => {
    const [lang] = useLanguage();
    return `${config.PROCHAIN_URL}${lang === "vi" ? "/tra-cuu" : "/en/verify"}`;
};
