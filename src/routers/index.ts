import {type RouterConfig} from "@clairejs/client";
import {importDelay as _importDelay} from "@clairejs/react";
import {lazy, type ComponentType} from "react";

import {Root} from "../app";

const importDelay = _importDelay as <T extends ComponentType<object>>(
  promise: Promise<{default: T}>,
) => () => Promise<{default: T}>;

const TrackingPage = lazy(importDelay(import("../pages/tracking")));
const EntityPage = lazy(importDelay(import("../pages/entity")));

const routes: RouterConfig = {
  path: "",
  component: {view: Root},
  children: [
    {path: "p/:uuid", component: {view: TrackingPage}},
    {path: "e/:uuid", component: {view: EntityPage}},
  ],
};

export default routes;
