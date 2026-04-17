import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { langs, useSetLanguage } from "../helpers/language";

const langList = [
    { code: "vi", name: "Tiếng Việt" },
    { code: "en", name: "English" },
];

interface Props {
    compact?: boolean;
    dropUp?: boolean;
    disabled?: boolean;
    onChange?: (code: string) => Promise<void> | void;
}

export function LangSwitcher({ compact, dropUp, disabled, onChange }: Props) {
    const { lang, setLanguage } = useSetLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const langName = langList.find((l) => l.code === lang)?.name || langs[lang || ""]?.long || "";

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                disabled={disabled}
                onClick={() => {
                    if (!disabled) setOpen((v) => !v);
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    border: "1px solid var(--lp-btn-default-border)",
                    borderRadius: 6,
                    background: "transparent",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    color: "var(--lp-text)",
                }}>
                <Globe size={16} /> {compact ? "" : langName}
            </button>
            {open && (
                <div
                    style={{
                        position: "absolute",
                        ...(dropUp ? { bottom: "100%", marginBottom: 6 } : { top: "100%", marginTop: 6 }),
                        right: 0,
                        minWidth: 140,
                        zIndex: 100,
                        background: "var(--lp-glass-bg)",
                        border: "1px solid var(--lp-glass-border)",
                        borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                    }}>
                    {langList.map((l) => (
                        <button
                            key={l.code}
                            disabled={disabled}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 16px",
                                fontSize: 14,
                                border: "none",
                                background: "transparent",
                                cursor: disabled ? "not-allowed" : "pointer",
                                color:
                                    l.code === lang
                                        ? "var(--lp-brand)"
                                        : "var(--lp-text)",
                                fontWeight: l.code === lang ? 600 : 400,
                            }}
                            onClick={async () => {
                                if (disabled) return;
                                await setLanguage(l.code);
                                await onChange?.(l.code);
                                setOpen(false);
                            }}>
                            {l.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
