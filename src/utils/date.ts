const pad = (value: number) => String(value).padStart(2, "0");

export const formatDate = (value?: number | string | null) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateTime = (value?: number | string | null) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return `${formatDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
