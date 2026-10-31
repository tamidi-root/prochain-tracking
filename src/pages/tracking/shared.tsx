import {Tlt} from "@clairejs/react";
import {Monitor, Moon, Sun} from "lucide-react";
import type {ReactNode} from "react";

import {LangSwitcher} from "../../components/lang-switcher";
import {config} from "../../config/config";
import {useTheme} from "../../providers/theme";

export function SectionWrapper({
  children,
  padding,
}: {
  children: React.ReactNode;
  mini?: boolean;
  padding?: string;
}) {
  return (
    <div className="wrap" style={{padding: padding || "0 0 32px"}}>
      {children}
    </div>
  );
}

//-- One titled band of the lot page, laid out like the reference design at prochain.network/tra-cuu/demo:
//-- the eyebrow sits in a narrow left column, the content in the wide right one, bands split by hairlines.
export function Part({label, children}: {label: ReactNode; children: ReactNode}) {
  return (
    <section className="grid part">
      <div className="col-4">
        <p className="eyebrow">{label}</p>
      </div>
      <div className="col-8">{children}</div>
    </section>
  );
}

//-- The marketing site's mark and wordmark (web-ui pages/site/components/logo.tsx), inlined because this
//-- repo imports no application code from the monorepo.
export function Logo({size = 22}: {size?: number}) {
  return (
    <span className="logo" style={{fontSize: size * 0.95}}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M4 18 L12 6" />
        <path d="M9 18 L17 6" />
        <path d="M14 18 L22 6" opacity=".45" />
      </svg>
      <span>
        pro<b>Chain</b>
        <sup>®</sup>
      </span>
    </span>
  );
}

function ThemeSwitcher() {
  const {themeMode, toggleTheme} = useTheme();
  const Icon =
    themeMode === "dark" ? Moon : themeMode === "light" ? Sun : Monitor;

  return (
    <button
      className="button compact"
      onClick={toggleTheme}
      title={themeMode || "auto"}
      type="button"
    >
      <Icon size={16} style={{display: "block"}} />
    </button>
  );
}

export function SiteHeader() {

  return (
    <header className="site-header">
      <div className="wrap bar">
        <a href={config.PROCHAIN_URL} className="brand" aria-label="proChain">
          <Logo />
        </a>
        <div className="actions">
          <LangSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export function ProfileFooter() {
  return (
    <footer className="wrap site-footer">
      <p className="faint small">
        <Tlt template="Powered by {brand}" data={{brand: "proChain"}} /> ·{" "}
        <a href={config.PROCHAIN_URL}>
          <Tlt template="Create a record for your own product" /> →
        </a>
      </p>
    </footer>
  );
}
