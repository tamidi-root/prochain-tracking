const defaultLocale = navigator.language || "en-US";

export const formatDate = (value?: number | string | null, locale = defaultLocale) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

export const formatDateTime = (value?: number | string | null, locale = defaultLocale) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
};
