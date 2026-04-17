import { AbstractStorage } from "@clairejs/client";
import { getSystemLocale } from "@clairejs/core";
import { Outlet } from "@clairejs/react-web";
import { useEffect } from "react";

import { ThemeProvider } from "./providers/theme";
import { useTheme } from "./providers/theme";
import { LANG_STORAGE_KEY, langs, useInject, useSetLanguage } from "./helpers/language";

const useSetupColorMode = () => {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    }, [isDarkMode]);
};

const useLoadLanguages = () => {
    const storage = useInject(AbstractStorage);
    const { lang, setLanguage } = useSetLanguage();

    useEffect(() => {
        if (!lang) {
            const queryLang = new URLSearchParams(window.location.search).get("lang") ?? undefined;
            storage.getItem<string>(LANG_STORAGE_KEY).then((persistedLang) => {
                const userLang = queryLang || persistedLang;
                setLanguage(userLang && langs[userLang] ? userLang : getSystemLocale());
            });
        }
    }, [lang]);
};

function AppShell() {
    useSetupColorMode();
    useLoadLanguages();
    return (
        <div className="app-shell">
            <Outlet />
        </div>
    );
}

export function Root() {
    return (
        <ThemeProvider>
            <AppShell />
        </ThemeProvider>
    );
}
