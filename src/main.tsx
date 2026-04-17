import {Translator, type TranslationData} from "@clairejs/client";
import {getServiceProvider, setSystemLocale} from "@clairejs/core";
import {ClaireApp} from "@clairejs/react";
import {LocalStorage, ReactWebRoutes} from "@clairejs/react-web";
import {createRoot} from "react-dom/client";

import en from "./assets/translations/en.json";
import vi from "./assets/translations/vi.json";

import routes from "./routers";

import "./index.css";

const bootstrap = async () => {
  const serviceProvider = getServiceProvider();
  serviceProvider.register(LocalStorage);
  serviceProvider.register(Translator);
  setSystemLocale("en");
};

const container = document.getElementById("root")!;

createRoot(container).render(
  <ClaireApp
    stores={[]}
    bootstrap={bootstrap}
    translations={{
      vi: Promise.resolve<TranslationData>(vi),
      en: Promise.resolve<TranslationData>(en),
    }}
  >
    <ReactWebRoutes routeConfig={routes} />
  </ClaireApp>,
);
