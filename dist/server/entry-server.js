import { jsxs, jsx } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { useState } from "react";
const App = ({ data }) => {
  const [count, setCount] = useState(0);
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx("h1", { children: "App" }),
    /* @__PURE__ */ jsx("p", { children: "Lorem Ipsum" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { children: count }),
      /* @__PURE__ */ jsx("button", { onClick: () => setCount(count + 1), children: "Count" })
    ] }),
    /* @__PURE__ */ jsx("pre", { children: JSON.stringify(data, null, 2) })
  ] });
};
const render = (data) => {
  return renderToString(/* @__PURE__ */ jsx(App, { data }));
};
export {
  render
};
