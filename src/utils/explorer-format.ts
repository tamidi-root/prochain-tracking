export const shortHash = (value: string, head = 6, tail = 4) =>
    value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;

export const shortUuid = (uuid: string) => uuid.slice(0, 8);

//-- The site language ("vi", "en", or "" before one is picked) to a number locale: Vietnamese groups
//-- thousands with dots, English with commas.
export const formatNumber = (value: number | string, lang?: string) => {
    const number = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(number) ? number.toLocaleString(lang === "vi" ? "vi-VN" : "en-US") : String(value);
};

//-- "40s", "15m", "3h", "2d": the age column, which the caller wraps in its own translated "{age} ago".
export const formatAge = (unixSeconds: number, nowMs = Date.now()) => {
    const seconds = Math.max(0, Math.floor(nowMs / 1000 - unixSeconds));
    if (seconds < 60) {
        return `${seconds}s`;
    }
    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m`;
    }
    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h`;
    }
    if (seconds < 86400 * 365) {
        return `${Math.floor(seconds / 86400)}d`;
    }
    return `${Math.floor(seconds / (86400 * 365))}y`;
};

//-- ISO date (2027-08-05): unambiguous in both Vietnamese and English.
export const formatIsoDate = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const isTxHash = (value: string) => /^0x[0-9a-f]{64}$/i.test(value);
export const isAddress = (value: string) => /^0x[0-9a-f]{40}$/i.test(value);

//-- Initials for a product with no photo: the first letters of its first two words.
export const initials = (name: string) =>
    name
        .split(/[\s/]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
