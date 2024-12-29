import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { useState } from "react";
function Banner() {
  return /* @__PURE__ */ jsx("nav", { className: "navbar navbar-expand-lg navbar-dark bg-dark", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("a", { className: "navbar-brand", href: "#", children: "[Game Name Here]" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "navbar-toggler",
        type: "button",
        "data-toggle": "collapse",
        "data-target": "#navbarsExample07",
        "aria-controls": "navbarsExample07",
        "aria-expanded": "true",
        "aria-label": "Toggle navigation",
        children: /* @__PURE__ */ jsx("span", { className: "navbar-toggler-icon" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "navbar-collapse collapse show", id: "navbarsExample07", children: /* @__PURE__ */ jsxs("ul", { className: "navbar-nav mr-auto", children: [
      /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/play", children: "Play" }) }),
      /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/my-stats", children: "My Stats" }) }),
      /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/user-stats", children: "User Stats" }) })
    ] }) })
  ] }) });
}
function Play() {
  return /* @__PURE__ */ jsx("h1", { children: "Play" });
}
function Console() {
  const [consoleText, setConsoleText] = useState("Hello");
  function enter_clicked() {
    console.log("TEST");
  }
  console.log("test2");
  function handleClick() {
    setCountButton(countButton + 1);
  }
  const handleClickr = (event) => {
    event.stopPropagation();
    console.log("Button clicked!");
  };
  const TestButton = ({ onClick }) => /* @__PURE__ */ jsx("button", { onClick: { onClick }, children: "TESTARHRUEGFE" });
  const [countButton, setCountButton] = useState(0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("p", { children: [
      "User : ",
      consoleText
    ] }),
    /* @__PURE__ */ jsx("form", { children: /* @__PURE__ */ jsx("input", { type: "text", name: "console_input" }) }),
    /* @__PURE__ */ jsx("button", { onClick: enter_clicked, type: "button", id: "enter_button", children: "Enter" }),
    /* @__PURE__ */ jsx("button", { onClick: () => setConsoleText((consoleText2) => "ERM"), type: "button", children: consoleText }),
    /* @__PURE__ */ jsx("button", { onClick: () => alert("HELP ME"), type: "button", children: "3" }),
    /* @__PURE__ */ jsxs("button", { onClick: handleClick, children: [
      "Clicked ",
      countButton,
      " Times"
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: handleClickr, type: "button", children: "ARGHGEUWDGUDF" }),
    /* @__PURE__ */ jsx(TestButton, {})
  ] });
}
const App = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Banner, {}),
    /* @__PURE__ */ jsx(Play, {}),
    /* @__PURE__ */ jsx(Console, {})
  ] });
};
const render = (data) => {
  return renderToString(/* @__PURE__ */ jsx(App, { data }));
};
export {
  render
};
