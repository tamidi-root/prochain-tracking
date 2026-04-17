import { Tlt } from "@clairejs/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Link } from "@clairejs/react-web";
import logoSvg from "../../assets/logo.svg";
import { LangSwitcher } from "../../components/lang-switcher";
import { config } from "../../config/config";
import { useTheme } from "../../providers/theme";

export function SectionWrapper({
    children,
    mini,
    padding,
}: {
    children: React.ReactNode;
    mini: boolean;
    padding?: string;
}) {
    return (
        <div
            style={{
                width: "100%",
                boxSizing: "border-box",
                padding: padding || (mini ? "0 24px 24px" : "0 max(40px, calc((100% - 1120px) / 2 + 40px)) 32px"),
            }}>
            {children}
        </div>
    );
}

function ThemeSwitcher() {
    const { themeMode, toggleTheme } = useTheme();
    const Icon = themeMode === "dark" ? Moon : themeMode === "light" ? Sun : Monitor;

    return (
        <button className="button" onClick={toggleTheme} title={themeMode || "auto"} type="button">
            <Icon size={16} style={{ color: "var(--lp-btn-text)", display: "block" }} />
        </button>
    );
}

export function ProfileFooter({ mini }: { mini: boolean }) {
    const { isDarkMode } = useTheme();
    const sidePadding = mini ? "24px" : "max(40px, calc((100% - 1120px) / 2 + 40px))";
    return (
        <div className="footer-section" style={{ flexWrap: "nowrap", alignItems: "center", padding: `24px ${sidePadding}` }}>
            <div className="left logo-and-name" style={{ flexWrap: "nowrap", alignItems: "center" }}>
                <a href={config.PROCHAIN_URL} target="_blank" rel="noreferrer" className="logo" style={{ textDecoration: "none" }}>
                    <img alt="proChain" src={logoSvg} style={{ width: 20, height: 20, filter: isDarkMode ? "brightness(0) invert(1)" : "brightness(0)" }} />
                    <div className="copyright"><Tlt template="Powered by {brand}" data={{ brand: "prochain.network" }} /></div>
                </a>
            </div>
            <div className="flex flex-row items-center" style={{ gap: 13 }}>
                <LangSwitcher dropUp />
                <ThemeSwitcher />
            </div>
        </div>
    );
}
