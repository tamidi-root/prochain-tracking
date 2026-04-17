import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ColorMode = "light" | "dark" | "auto";
type ExplicitColorMode = "light" | "dark";

const THEME_KEY = "tracking-web-theme";

const ThemeContext = createContext({
    themeMode: undefined as ColorMode | undefined,
    isDarkMode: false,
    toggleTheme: () => {},
    setTheme: (_mode: ColorMode) => {},
});

function getInitialMode(): ColorMode {
    return (localStorage.getItem(THEME_KEY) as ColorMode) || "auto";
}

function ThemeProviderInner({ children, getSystemColor }: { children: ReactNode; getSystemColor?: () => ExplicitColorMode | undefined }) {
    const systemTheme = getSystemColor?.();

    const [themeMode, setThemeMode] = useState<ColorMode>(getInitialMode);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const mode = getInitialMode();
        return mode === "auto" ? systemTheme === "dark" : mode === "dark";
    });

    const setTheme = (mode: ColorMode) => {
        localStorage.setItem(THEME_KEY, mode);
        setThemeMode(mode);
    };

    const toggleTheme = () => {
        const newTheme = themeMode === "dark" ? "light" : themeMode === "light" ? "auto" : "dark";
        setTheme(newTheme);
    };

    useEffect(() => {
        if (themeMode === "auto") {
            setIsDarkMode(systemTheme === "dark");
        } else {
            setIsDarkMode(themeMode === "dark");
        }
    }, [themeMode, systemTheme]);

    return (
        <ThemeContext.Provider value={{ themeMode, isDarkMode, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProviderInner
            getSystemColor={() => {
                const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
                return isDarkMode ? "dark" : "light";
            }}>
            <div style={{ width: "100%", display: "flex" }}>
                {children}
            </div>
        </ThemeProviderInner>
    );
}
