//-- The short, typeable identifier for a production lot: `{entity short_name}.{readable_id}`.
//--
//-- A lot's uuid is 36 characters and nobody types it. The code composes two identifiers that
//-- already exist and already mean something to a person:
//--
//--     ACME.L2401        ACME.LOT-2024-01
//--
//-- The separator is "." rather than "-" because only "-", ".", "_" and "~" survive both
//-- encodeURIComponent and a strict percent-encoder untouched, and "-" is spent letting both halves
//-- keep the hyphens real lot numbers use.
//--
//-- DUPLICATED DELIBERATELY. This repo is standalone and imports no application code from the
//-- supply chain monorepo — see README — the same reason uuidToBytes16 is copied into utils/data.
//-- The authoritative version, with its tests, is shared/common/src/helpers/public-code.ts there.
//-- Only formatting is copied: parsing belongs to the backend redirect, not to this app.

export const PUBLIC_CODE_SEPARATOR = ".";

export const normalizeShortName = (raw: string) => raw.trim().toUpperCase();

export const normalizeReadableId = (raw: string) => raw.trim().toUpperCase();

/**
 * Compose the public code a consumer would type to reach this page.
 *
 * Returns undefined unless both halves are present, so a lot whose producer has no short name
 * falls back to showing the lot number alone rather than a code with a dangling separator.
 */
export const formatPublicCode = (shortName?: string, readableId?: string) => {
    if (!shortName?.trim() || !readableId?.trim()) {
        return undefined;
    }

    return `${normalizeShortName(shortName)}${PUBLIC_CODE_SEPARATOR}${normalizeReadableId(readableId)}`;
};
