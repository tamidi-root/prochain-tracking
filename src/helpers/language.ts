import { AbstractStorage } from "@clairejs/client";
import { type AbstractConstructor, getServiceProvider } from "@clairejs/core";
import { useLanguage } from "@clairejs/react";
import { useRef } from "react";

export const LANG_STORAGE_KEY = "LANGUAGE";

export const langs: Record<string, { short: string; long: string }> = {
    vi: { short: "VI", long: "Tiếng Việt" },
    en: { short: "EN", long: "English" },
};

export const useInject = <T,>(cls: AbstractConstructor<T>) => {
    const instance = useRef(getServiceProvider().getInjector().resolve(cls));
    return instance.current as T;
};

export const useSetLanguage = () => {
    const storage = useInject(AbstractStorage);
    const [lang, setLang] = useLanguage();

    const setLanguage = async (code: string) => {
        setLang(code);
        await storage.setItem(LANG_STORAGE_KEY, code);
    };

    return { lang, setLanguage };
};
