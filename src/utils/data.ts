export const capitalize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export const uuidToBytes16 = (uuid: string) => {
    return `0x${uuid.replace(/-/g, "")}`;
};

export const isRichTextEmpty = (value?: string | null) => {
    if (!value) {
        return true;
    }

    const stripped = value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return stripped.length === 0;
};
