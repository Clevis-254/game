import { jsx } from "react/jsx-runtime";
import { hydrateRoot } from "react-dom/client";
import { d as distExports, A as App } from "./assets/App-C2PzmEyf.js";
import "react";
import "react-dom";
import "turbo-stream";
import "cookie";
import "set-cookie-parser";
hydrateRoot(
  document.getElementById("app"),
  /* @__PURE__ */ jsx(distExports.BrowserRouter, { children: /* @__PURE__ */ jsx(App, {}) })
);
