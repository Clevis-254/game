import { jsx } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { d as distExports, A as App } from "./assets/App-C2PzmEyf.js";
import "react";
import "react-dom";
import "turbo-stream";
import "cookie";
import "set-cookie-parser";
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(distExports.StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) })
  );
}
export {
  render
};
