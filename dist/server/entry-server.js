import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from "react";
import { stripBasename, UNSAFE_warning, UNSAFE_invariant, joinPaths, matchPath, Action } from "@remix-run/router";
import { UNSAFE_NavigationContext, useHref, useResolvedPath, useLocation, UNSAFE_DataRouterStateContext, useNavigate, createPath, UNSAFE_useRouteId, UNSAFE_RouteContext, UNSAFE_DataRouterContext, parsePath, Router, Routes, Route } from "react-router";
import "react-dom";
import { Sword } from "lucide-react";
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
/**
 * React Router DOM v6.20.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
const defaultMethod = "get";
const defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
let _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
const supportedFormEncTypes = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    process.env.NODE_ENV !== "production" ? UNSAFE_warning(false, '"' + encType + '" is not a valid `encType` for `<Form>`/`<fetcher.Form>` ' + ('and will default to "' + defaultEncType + '"')) : void 0;
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}
const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "unstable_viewTransition"], _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "unstable_viewTransition", "children"], _excluded3 = ["fetcherKey", "navigate", "reloadDocument", "replace", "state", "method", "action", "onSubmit", "relative", "preventScrollReset", "unstable_viewTransition"];
const ViewTransitionContext = /* @__PURE__ */ React.createContext({
  isTransitioning: false
});
if (process.env.NODE_ENV !== "production") {
  ViewTransitionContext.displayName = "ViewTransition";
}
const FetchersContext = /* @__PURE__ */ React.createContext(/* @__PURE__ */ new Map());
if (process.env.NODE_ENV !== "production") {
  FetchersContext.displayName = "Fetchers";
}
if (process.env.NODE_ENV !== "production") ;
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const Link = /* @__PURE__ */ React.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace,
    state,
    target,
    to,
    preventScrollReset,
    unstable_viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX$1.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        process.env.NODE_ENV !== "production" ? UNSAFE_warning(false, '<Link to="' + to + '"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.') : void 0;
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
    preventScrollReset,
    relative,
    unstable_viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ React.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
if (process.env.NODE_ENV !== "production") {
  Link.displayName = "Link";
}
const NavLink = /* @__PURE__ */ React.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    unstable_viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = React.useContext(UNSAFE_DataRouterStateContext);
  let {
    navigator
  } = React.useContext(UNSAFE_NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && unstable_viewTransition === true;
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ React.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    unstable_viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
if (process.env.NODE_ENV !== "production") {
  NavLink.displayName = "NavLink";
}
const Form = /* @__PURE__ */ React.forwardRef((_ref9, forwardedRef) => {
  let {
    fetcherKey,
    navigate,
    reloadDocument,
    replace,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    unstable_viewTransition
  } = _ref9, props = _objectWithoutPropertiesLoose(_ref9, _excluded3);
  let submit = useSubmit();
  let formAction = useFormAction(action, {
    relative
  });
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let submitHandler = (event) => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      fetcherKey,
      method: submitMethod,
      navigate,
      replace,
      state,
      relative,
      preventScrollReset,
      unstable_viewTransition
    });
  };
  return /* @__PURE__ */ React.createElement("form", _extends({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}
if (process.env.NODE_ENV !== "production") ;
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook2["UseSubmit"] = "useSubmit";
  DataRouterHook2["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook2["UseFetcher"] = "useFetcher";
  DataRouterHook2["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseFetcher"] = "useFetcher";
  DataRouterStateHook2["UseFetchers"] = "useFetchers";
  DataRouterStateHook2["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = React.useContext(UNSAFE_DataRouterContext);
  !ctx ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, getDataRouterConsoleError(hookName)) : UNSAFE_invariant(false) : void 0;
  return ctx;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    unstable_viewTransition
  } = _temp === void 0 ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return React.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace,
        state,
        preventScrollReset,
        relative,
        unstable_viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, unstable_viewTransition]);
}
function useSearchParams(defaultInit) {
  process.env.NODE_ENV !== "production" ? UNSAFE_warning(typeof URLSearchParams !== "undefined", "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params\n\nIf you're unsure how to load polyfills, we recommend you check out https://polyfill.io/v3/ which provides some recommendations about how to load polyfills only for users that need them, instead of for every user.") : void 0;
  let defaultSearchParamsRef = React.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = React.useRef(false);
  let location = useLocation();
  let searchParams = React.useMemo(() => (
    // Only merge in the defaults if we haven't yet called setSearchParams.
    // Once we call that we want those to take precedence, otherwise you can't
    // remove a param with setSearchParams({}) if it has an initial value
    getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current)
  ), [location.search]);
  let navigate = useNavigate();
  let setSearchParams = React.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. Try calling submit within a `useEffect` or callback instead.");
  }
}
let fetcherId = 0;
let getUniqueFetcherId = () => "__" + String(++fetcherId) + "__";
function useSubmit() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseSubmit);
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let currentRouteId = UNSAFE_useRouteId();
  return React.useCallback(function(target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    if (options.navigate === false) {
      let key = options.fetcherKey || getUniqueFetcherId();
      router.fetch(key, currentRouteId, options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        unstable_flushSync: options.unstable_flushSync
      });
    } else {
      router.navigate(options.action || action, {
        preventScrollReset: options.preventScrollReset,
        formData,
        body,
        formMethod: options.method || method,
        formEncType: options.encType || encType,
        replace: options.replace,
        state: options.state,
        fromRouteId: currentRouteId,
        unstable_flushSync: options.unstable_flushSync,
        unstable_viewTransition: options.unstable_viewTransition
      });
    }
  }, [router, basename, currentRouteId]);
}
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = React.useContext(UNSAFE_NavigationContext);
  let routeContext = React.useContext(UNSAFE_RouteContext);
  !routeContext ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, "useFormAction must be used inside a RouteContext") : UNSAFE_invariant(false) : void 0;
  let [match] = routeContext.matches.slice(-1);
  let path = _extends({}, useResolvedPath(action ? action : ".", {
    relative
  }));
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    if (params.has("index") && params.get("index") === "") {
      params.delete("index");
      path.search = params.toString() ? "?" + params.toString() : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function useViewTransitionState(to, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let vtContext = React.useContext(ViewTransitionContext);
  !(vtContext != null) ? process.env.NODE_ENV !== "production" ? UNSAFE_invariant(false, "`unstable_useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?") : UNSAFE_invariant(false) : void 0;
  let {
    basename
  } = useDataRouterContext(DataRouterHook.useViewTransitionState);
  let path = useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
function StaticRouter({
  basename,
  children,
  location: locationProp = "/"
}) {
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let action = Action.Pop;
  let location = {
    pathname: locationProp.pathname || "/",
    search: locationProp.search || "",
    hash: locationProp.hash || "",
    state: locationProp.state || null,
    key: locationProp.key || "default"
  };
  let staticNavigator = getStatelessNavigator();
  return /* @__PURE__ */ React.createElement(Router, {
    basename,
    children,
    location,
    navigationType: action,
    navigator: staticNavigator,
    static: true
  });
}
function getStatelessNavigator() {
  return {
    createHref,
    encodeLocation,
    push(to) {
      throw new Error(`You cannot use navigator.push() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)})\` somewhere in your app.`);
    },
    replace(to) {
      throw new Error(`You cannot use navigator.replace() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere in your app.`);
    },
    go(delta) {
      throw new Error(`You cannot use navigator.go() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${delta})\` somewhere in your app.`);
    },
    back() {
      throw new Error(`You cannot use navigator.back() on the server because it is a stateless environment.`);
    },
    forward() {
      throw new Error(`You cannot use navigator.forward() on the server because it is a stateless environment.`);
    }
  };
}
function createHref(to) {
  return typeof to === "string" ? to : createPath(to);
}
function encodeLocation(to) {
  let href = typeof to === "string" ? to : createPath(to);
  let encoded = ABSOLUTE_URL_REGEX.test(href) ? new URL(href) : new URL(href, "http://localhost");
  return {
    pathname: encoded.pathname,
    search: encoded.search,
    hash: encoded.hash
  };
}
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function Banner() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };
  return /* @__PURE__ */ jsx("nav", { className: "navbar navbar-expand-lg navbar-dark bg-dark", children: /* @__PURE__ */ jsxs("div", { className: "container d-flex justify-content-between", children: [
    /* @__PURE__ */ jsx("a", { className: "navbar-brand", href: "/", children: "TOXIC RŌNIN" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "navbar-toggler",
        type: "button",
        "data-toggle": "collapse",
        "data-target": "#navbarsExample07",
        "aria-controls": "navbarsExample07",
        "aria-expanded": "false",
        "aria-label": "Toggle navigation",
        children: /* @__PURE__ */ jsx("span", { className: "navbar-toggler-icon" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "collapse navbar-collapse justify-content-between", id: "navbarsExample07", children: [
      /* @__PURE__ */ jsxs("ul", { className: "navbar-nav", children: [
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/play", children: "Play" }) }),
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/my-stats", children: "My Stats" }) }),
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("a", { className: "nav-link", href: "/user-stats", children: "User Stats" }) }),
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(Link, { className: "nav-link", to: "/settings", children: "Settings" }) })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-link nav-link", onClick: handleLogout, children: [
        /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx(
          "path",
          {
            stroke: "White",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: "10",
            strokeWidth: "1.5",
            d: "M17.44 14.62L20 12.06 17.44 9.5M9.76 12.06h10.17M11.76 20c-4.42 0-8-3-8-8s3.58-8 8-8"
          }
        ) }),
        "Logout"
      ] })
    ] })
  ] }) });
}
function Hero() {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "vh-100 position-relative d-flex align-items-center justify-content-center",
      style: {
        backgroundImage: 'url("/assets/LandingPageBackground.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center"
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75" }),
        /* @__PURE__ */ jsxs("div", { className: "container position-relative text-center text-white", children: [
          /* @__PURE__ */ jsx("h1", { className: "display-2 fw-bold mb-4", children: "TOXIC RŌNIN" }),
          /* @__PURE__ */ jsx("p", { className: "lead mb-5", children: "Embark on a perilous journey as Miyamoto Musashi, the legendary swordsman whose path to glory is stained with the blood of his enemies." })
        ] })
      ]
    }
  );
}
function Features() {
  return /* @__PURE__ */ jsx("div", { className: "py-5 bg-dark bg-gradient", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "row g-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-md-4 text-center text-white", children: [
      /* @__PURE__ */ jsx(Sword, { className: "text-danger mb-3", size: 48 }),
      /* @__PURE__ */ jsx("h3", { className: "h4 mb-3", children: "Master the Blade" }),
      /* @__PURE__ */ jsx("p", { className: "text-white-50", children: "Perfect your swordsmanship through strategic combat and deadly precision." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-md-4 text-center text-white", children: [
      /* @__PURE__ */ jsx("div", { className: "text-danger mb-3 display-5", children: "行" }),
      /* @__PURE__ */ jsx("h3", { className: "h4 mb-3", children: "Honor & Revenge" }),
      /* @__PURE__ */ jsx("p", { className: "text-white-50", children: "Navigate a world where honor means everything and revenge drives your enemies." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-md-4 text-center text-white", children: [
      /* @__PURE__ */ jsx("div", { className: "text-danger mb-3 display-5", children: "侍" }),
      /* @__PURE__ */ jsx("h3", { className: "h4 mb-3", children: "Feudal Japan" }),
      /* @__PURE__ */ jsx("p", { className: "text-white-50", children: "Immerse yourself in a richly detailed world of samurai, honor, and betrayal." })
    ] })
  ] }) }) });
}
function speakText(text) {
  if (!window.speechSynthesis) {
    console.warn("SpeechSynthesis not supported by this browser.");
    return;
  }
  const ttsEnabled = localStorage.getItem("ttsEnabled") === "true";
  if (!ttsEnabled) {
    console.warn("TTS is disabled.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const storedVoiceName = localStorage.getItem("ttsVoice") || null;
  const storedPitch = parseFloat(localStorage.getItem("ttsPitch")) || 1;
  const storedRate = parseFloat(localStorage.getItem("ttsRate")) || 1;
  const storedVolume = parseFloat(localStorage.getItem("ttsVolume")) || 1;
  const voices = window.speechSynthesis.getVoices();
  if (storedVoiceName && voices.length > 0) {
    const selectedVoice = voices.find((voice) => voice.name === storedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }
  utterance.pitch = storedPitch;
  utterance.rate = storedRate;
  utterance.volume = storedVolume;
  window.speechSynthesis.speak(utterance);
}
function setUserTTSPreferences({ voiceName, pitch, rate, volume, enabled }) {
  if (typeof voiceName === "string") {
    localStorage.setItem("ttsVoice", voiceName);
  }
  if (typeof pitch === "number") {
    localStorage.setItem("ttsPitch", pitch.toString());
  }
  if (typeof rate === "number") {
    localStorage.setItem("ttsRate", rate.toString());
  }
  if (typeof volume === "number") {
    localStorage.setItem("ttsVolume", volume.toString());
  }
  if (typeof enabled === "boolean") {
    localStorage.setItem("ttsEnabled", enabled.toString());
  }
}
function getAvailableVoices() {
  if (!window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}
const Console = forwardRef(function Console2({
  transcriptRef,
  commandToGameTrigger,
  setCommandToGameTrigger,
  consoleToGameCommandRef
}, ref) {
  useImperativeHandle(ref, () => {
    return {
      callPostToConsole: (message, speaker, isTranscript) => {
        post_new_input(message, speaker, isTranscript);
      }
    };
  });
  const BASEURL = "http://localhost:4173";
  const inputRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  useEffect(() => {
    fetchConsoleHistory();
  }, []);
  const handleEnterKeyDown = (event) => {
    if (event.key === "Enter") {
      new_console_input();
    }
  };
  useEffect(() => {
    scrollConsoleToBottom();
  }, []);
  useEffect(() => {
    if (transcriptRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          scrollConsoleToBottom();
          if (mutation.type === "childList" || mutation.type === "characterData") {
            const transcriptContent = transcriptRef.current.innerHTML.trim();
            if (transcriptContent !== "") {
              if (transcriptContainerRef.current.contains(transcriptRef.current)) {
                transcriptContainerRef.current.appendChild(transcriptRef.current);
              }
            } else {
              if (!transcriptContainerRef.current.contains(transcriptRef.current)) {
                transcriptContainerRef.current.removeChild(transcriptRef.current);
              }
            }
          }
        });
      });
      observer.observe(transcriptRef.current, {
        childList: true
      });
      return () => observer.disconnect();
    }
  }, [transcriptRef]);
  const [consoleText, setConsoleText] = useState([]);
  useEffect(() => {
    scrollConsoleToBottom();
  }, [consoleText]);
  function commandToGame(command) {
    consoleToGameCommandRef.current = command;
    if (commandToGameTrigger === true) {
      setCommandToGameTrigger(false);
    } else {
      setCommandToGameTrigger(true);
    }
  }
  function new_console_input() {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const console_input_box = document.getElementById("console_input_box");
    const console_input_text = console_input_box.value;
    console_input_box.value = "";
    switch (console_input_text) {
      case "clear":
        setConsoleText([...consoleText, "Console : Clearing Console now..."]);
        clear_console_history();
        break;
      case "start game":
        post_new_input(console_input_text, "User");
        commandToGame(console_input_text);
        post_new_input("Starting game now...", "Console");
        break;
      case "help":
        post_new_input(console_input_text, "User");
        const outputList = [
          "Here is a list of all current commands",
          "- 'start game' : Starts the game from the last saved point",
          "- 'end game' : Ends the game session",
          "- 'restart' : Restarts the game session from the beginning",
          "- 'clear' : Clear the console history (does not affect the game)",
          "- 'pause' : Pause the current dialogue",
          "- 'play' : Play paused dialogue",
          "- 'speed up' : Speed up dialogue",
          "- 'slow down' : Slow down dialogue",
          "- 'rewind' : Rewind 10 seconds of dialogue"
        ];
        for (let i in outputList) {
          post_new_input(outputList[i], "Console");
        }
        break;
      case "help combat":
        post_new_input("In this game you will fight many enemies in battle. These battles are turn based.In battle you have four moves, slash, stab, parry slash and parry stab. Slash is a standard attack that can be parried withparry slash, stab is a move that you charge up on your initial turn and can then either go throughwith it  on your next turn and do lots of damage to your opponent or you can switch to slash to trick your opponent.Be wary however as if your opponent predicts this and picks parry slash then you will the stunned andmiss a turn. The same goes for if your opponent predicts you follow through and they pick parry stab.This makes stab a risky move but with high reward.", "");
        break;
      case "play":
      case "pause":
      case "speed up":
      case "slow down":
      case "rewind":
      case "end game":
      case "restart":
        post_new_input(console_input_text, "User");
        commandToGame(console_input_text);
        break;
      default:
        if (console_input_text !== "") {
          post_new_input(console_input_text, "User");
          commandToGame(console_input_text);
        }
    }
    scrollConsoleToBottom();
  }
  function post_new_input(message, speaker, isTranscript) {
    if (speaker !== "User" && !isTranscript) speakText(message);
    if (speaker !== "") {
      setConsoleText((prevConsoleText) => [...prevConsoleText, `${speaker} : ${message}`]);
    } else {
      setConsoleText((prevConsoleText) => [...prevConsoleText, `${message}`]);
    }
    fetch("/post_console_history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        MessageID: consoleText.length,
        Message: message,
        Speaker: speaker
      })
    });
  }
  function clear_console_history() {
    setConsoleText([]);
    fetch("/post_clear_console", {
      method: "POST"
    });
  }
  const fetchConsoleHistory = async () => {
    try {
      const response = await fetch(BASEURL + "/get_console_history");
      const result = await response.json();
      let resultMessages = [];
      for (let i = 0; i < result[0].Messages.length; i++) {
        if (result[0].Messages[i].Speaker === "") {
          resultMessages.push(result[0].Messages[i].Message);
        } else {
          resultMessages.push(result[0].Messages[i].Speaker + " : " + result[0].Messages[i].Message);
        }
      }
      setConsoleText(resultMessages);
    } catch (error) {
      console.error("Error fetching console history:", error);
    }
  };
  async function scrollConsoleToBottom() {
    if (transcriptContainerRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center gap-3 py-5 bg-dark", children: /* @__PURE__ */ jsxs("div", { className: "terminal", onClick: new_console_input, children: [
    /* @__PURE__ */ jsxs("div", { className: "terminal-output", ref: transcriptContainerRef, children: [
      consoleText.map((item, index) => /* @__PURE__ */ jsx("div", { className: "terminal-line", children: /* @__PURE__ */ jsx("span", { className: "terminal-response", children: /* @__PURE__ */ jsx("div", { children: item }, index) }) }, index)),
      /* @__PURE__ */ jsx("span", { ref: transcriptRef, className: "terminal-line" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "terminal-input-line", children: [
      /* @__PURE__ */ jsx("input", { type: "text", id: "console_input_box", className: "terminal-input-field", ref: inputRef, onKeyDown: handleEnterKeyDown }),
      /* @__PURE__ */ jsx("button", { onClick: new_console_input, type: "button", id: "enter_button", children: "Enter" })
    ] })
  ] }) }) });
});
function Story() {
  return /* @__PURE__ */ jsx("div", { className: "py-5 bg-dark", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsxs("div", { className: "col-lg-8 text-center text-white", children: [
    /* @__PURE__ */ jsx("h2", { className: "display-6 mb-4", children: "The Path of the Sword" }),
    /* @__PURE__ */ jsx("p", { className: "lead text-white-50 mb-4", children: "After defeating two warriors of the prestigious Yoshioka school, Miyamoto Musashi must face the consequences of his actions. Now hunted by those who seek revenge, every shadow could hide an assassin, every moment could be your last." }),
    /* @__PURE__ */ jsx("div", { className: "text-danger fw-bold fs-4", children: "Will you survive the path to becoming a legend?" })
  ] }) }) }) });
}
let transcripts = {
  "Intro": "^^^^In Toxic Rōnin, you play as Miyamoto Musashi, a Japanese warrior who aspires to become the greatest swordsman alive. In a bout to gain prestige on his path to glory, Musashi kills two combatants of the distinguished Yoshioka School, singlehandedly disgracing their reputation. Now the warriors seek revenge against the wandering samurai who dared to dishonour them... ^^^^^^ The poison is spreading. I’m dripping with sweat, I feel lightheaded, there’s a stabbing in my stomach like I swallowed a pair of sai. I thought I could trust my hosts, but they were obviously loyal to the Yoshioka School. So much for the right of hospitality. We all ate from the same pot, so there must be an antidote. I need to get to their school... before it’s too late.",
  "forestIntro": "^^^The entrance to the Yoshioka School is beyond the cave at the edge of these woods. Somehow I’ve got to get past their sentries. I did it once before, but with the state I’m in now I need to be more vigilant than ever. I can’t control the shaking of my limbs. Can’t even hold my katana still. This is going to be tough, but I’ve no choice if I want to see the sun rise tomorrow. Musashi stopped in his tracks. Though his usually acute senses were dulled somewhat, no poison could numb his instincts. Danger lay in the near vicinity to his left. The question was, did he have the strength to confront it, or should he take the risk of traversing the treacherous cliff on his right instead?",
  "riddleIntro": "The unassuming wall that loomed before him seemed just another mountain face in a museum of rock, but Musashi knew its secrets. This wasn’t a wall, but an entrance. The cave into the school is here, I remember it! Only problem is, they change the unlock sequence to ensure only authorised members can enter. I just need to find the new way in.",
  "ahRiddle": "Ah, a riddle.",
  "notHere": "Hmm. Not here.",
  "riddle": "I’m often seen but sometimes hidden, guarding spaces, unbidden. What am I?",
  "openDoor": "The spoken password caused a rectangular section of the rock to recede into the wall, revealing a doorway into the Yoshiokah school. Musashi had reached his destination. Just one challenge remained.",
  "finale": "Musashi strode the empty halls of the Yoshiokah school throwing caution to the wind. He was running out of time. I can feel my constitution draining by the minute. I’m… losing control… of my breathing….my limbs think twice before obeying… so… cold. I need to end this… fast! By the will of Shinigami, you should have been taken from this world hours ago. Is it a ghost I see before me? It will take a lot more than… a simple poison… to stop Miyamoto Musashi from achieving his goal. Not much more, it seems! You can’t even string a sentence together without needing to catch your breath! Musashi had had enough talking. This would only end one way. He had no second thoughts as he slid his katana from its sheath.",
  "ending": "Musashi didn’t even take a moment to regard the corpse that lay at his feet, the life he’d just taken. He simply reached down, searched the body’s pockets and pulled out a glass vile. This is it. My hosts each had this interesting little drink with them the night we ate together. A small bottle with a cork in the shape of a sakura flower. ‘Helps with digestion,’ they said. They were right! The story of the samurai who battled with death herself and still managed to vanquish his enemies became legend. Generations of young swordsmen modelled their lives and aspirations after the example set by Miyamoto Musashi, the Toxic Ronin. ^^^^",
  "forestObstacle": "Reaching the edge of the forest, the trees suddenly gave way to a thin stone pathway littered with stones from the mountain face on the left side of the alley. On the right was nothing but a drop into the unforgiving waves. The shivering samurai would need to fight the effects of the toxin and find his balance and control. After examining the wall of rock on his left, Musashi noticed something was wrong. I knew it couldn’t be as easy as it seemed. There are unnatural ridges in the rock wall. I suspect they’ve planted traps to push unwanted visitors into the ocean. I must think carefully before each step. Looks like I need to stay low for three steps, jump for the next, crouch again, then jump over the last one.",
  "forestFight": "Musashi moved with nonchalance and confidence, but he took caution in every step. He knew his best approach was to act unaware. Give his opponent or opponents the feeling that they had the advantage. Poison or no, the samurai’s unwavering discipline and determination made him a danger in any fight. His enemies would find out the hard way that assuming victory against Miyamoto Musashi was a sure way to sink yourself into an early grave."
};
function GameLogic({
  postTextToConsole,
  transcriptRef,
  commandToGameTrigger,
  setCommandToGameTrigger,
  consoleToGameCommandRef
}) {
  const audioRef = useRef(null);
  const waitingForUserInput = useRef("");
  let transcriptInterrupt = useRef(false);
  let delayedPosition = useRef(0);
  let isTranscriptRunning = useRef(false);
  let transcriptRewindSeconds = useRef(0);
  let audioSpeed = useRef(1);
  let transcriptNameRef = useRef("");
  let audioFinished = useRef(false);
  let opponent = useRef(0);
  useRef(null);
  const musicAudio = useRef(null);
  useEffect(() => {
    audioRef.current = document.createElement("audio");
    const handleAudioEnd = () => {
      console.log("audio finished");
      checkStoryBlock();
      audioFinished.current = true;
    };
    audioRef.current.addEventListener("ended", handleAudioEnd);
    const handleMusicEnd = () => {
      console.log("music ended");
      if (musicAudio.current) {
        musicAudio.current.play();
      }
    };
    musicAudio.current = document.createElement("audio");
    musicAudio.current.src = "src/Audio/Game Sounds/battle-music.mp3";
    musicAudio.current.addEventListener("ended", handleMusicEnd);
    return () => {
      audioRef.current.removeEventListener("ended", handleAudioEnd);
      musicAudio.current.removeEventListener("ended", handleMusicEnd);
    };
  }, []);
  function playSoundEffect(url) {
    const audio = new Audio(url);
    audio.play().catch((err) => {
      console.error("Error playing audio:", err);
    });
  }
  const audioStart = async () => {
    return new Promise((resolve) => {
      const onAudioEnd = () => {
        audioRef.current.removeEventListener("ended", onAudioEnd);
        resolve();
      };
      audioRef.current.playbackRate = audioSpeed.current;
      audioRef.current.addEventListener("ended", onAudioEnd);
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        resolve();
      });
    });
  };
  const audioPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      if (transcriptNameRef.current) {
        transcriptOutput(transcriptNameRef.current);
      }
    }
  };
  const audioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      transcriptInterrupt.current = true;
    }
  };
  const audioSpeedUp = () => {
    if (audioRef.current && audioRef.current.playbackRate < 3) {
      audioSpeed.current = audioRef.current.playbackRate += 0.5;
    }
  };
  const audioSlowDown = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed.current = Math.max(0.5, audioRef.current.playbackRate - 0.5);
    }
  };
  const audioRewind = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
      transcriptInterrupt.current = true;
      transcriptRewindSeconds.current = seconds;
    }
  };
  const isInitialRenderConsoleToGame = useRef(true);
  useEffect(() => {
    cmdFunc();
    async function cmdFunc() {
      console.log(`commandRef thing ran with command ${consoleToGameCommandRef.current}`);
      if (isInitialRenderConsoleToGame.current) {
        isInitialRenderConsoleToGame.current = false;
        return;
      }
      switch (consoleToGameCommandRef.current) {
        case "start game":
          tutorialQuestion();
          break;
        case "debug game":
          debugGame();
          break;
        case "play":
          audioPlay();
          break;
        case "pause":
          audioPause();
          break;
        case "speed up":
          audioSpeedUp();
          break;
        case "slow down":
          audioSlowDown();
          break;
        case "rewind":
          audioRewind(10);
          break;
        case "end game":
          endGame();
          break;
        case "restart":
          endGame(true);
          break;
        default:
          if (consoleToGameCommandRef !== "") {
            switch (waitingForUserInput.current) {
              case "TutorialQuestion":
                switch (consoleToGameCommandRef.current) {
                  case "yes":
                    tutorial();
                    waitingForUserInput.current = "";
                    break;
                  case "no":
                    startGame();
                    waitingForUserInput.current = "";
                    break;
                  default:
                    postTextToConsole(`Please say "yes" or "no"`, "");
                    break;
                }
                break;
              case "Forest":
                if (consoleToGameCommandRef.current === "left") {
                  forestLeft();
                } else if (consoleToGameCommandRef.current === "right") {
                  forestRight();
                } else {
                  postTextToConsole(`Please pick either "left" or "right"`, "");
                }
                waitingForUserInput.current = "";
                break;
              case "Combat":
                switch (consoleToGameCommandRef.current) {
                  case "slash":
                  case "stab":
                  case "parry slash":
                  case "parry stab":
                    combatMove(consoleToGameCommandRef.current);
                    break;
                  default:
                    postTextToConsole("Not a valid move. Use help combat to learn more", "");
                    break;
                }
                postTextToConsole("Pick your move!", "");
                break;
              case "riddleStart":
                switch (consoleToGameCommandRef.current) {
                  case "up":
                  case "right":
                  case "left":
                    riddleSearchWrong();
                    break;
                  case "down":
                    riddleFound();
                    break;
                  default:
                    postTextToConsole("Not a place to search on the wall. Try again", "");
                    await new Promise((resolve) => setTimeout(resolve, 4e3));
                    playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
                }
                break;
              case "Riddle":
                switch (consoleToGameCommandRef.current) {
                  case "door":
                  case "a door":
                    riddleDoorOpen();
                    break;
                  default:
                    postTextToConsole("That is not the answer. Guess again", "");
                    await new Promise((resolve) => setTimeout(resolve, 3e3));
                    playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
                }
                break;
              case "forestObstacle":
                if (consoleToGameCommandRef.current === "hint") {
                  forestRight();
                } else if (consoleToGameCommandRef.current === forestObstacleOrder[forestObstacleProgress.current]) {
                  postTextToConsole("Correct guess, move forward", "");
                  forestObstacleProgress.current++;
                  await new Promise((resolve) => setTimeout(resolve, 2e3));
                  playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
                  if (forestObstacleProgress.current === 6) {
                    postTextToConsole("You made it past the traps!", "");
                    riddleStart();
                  }
                } else if (consoleToGameCommandRef.current === "crouch" || consoleToGameCommandRef.current === "jump") {
                  if (obstacleStamina.current !== 0) {
                    obstacleStamina.current--;
                    postTextToConsole(`The trap pushes Musashi but he manages to stabilize himself. He can only do this ${obstacleStamina.current} more times before he falls!`, "");
                    await new Promise((resolve) => setTimeout(resolve, 8e3));
                    playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
                  } else {
                    postTextToConsole("Musashi was knocked into the ocean! Game Over.", "");
                    endGame(true);
                  }
                } else {
                  postTextToConsole(`Not a valid option. Please say "jump" or "crouch"`, "");
                  await new Promise((resolve) => setTimeout(resolve, 4e3));
                  playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
                }
              default:
                console.log("GameLogic:Not a command match");
            }
          }
      }
      consoleToGameCommandRef.current = "";
    }
  }, [commandToGameTrigger]);
  let storyBlock;
  function checkStoryBlock() {
    if (storyBlock && audioFinished.current === true && delayedPosition.current === 0) {
      audioFinished.current = false;
      storyBlock("storyBlock ran");
    }
  }
  async function endGame(restart) {
    if (cancelGame) cancelGame("Ended Game");
    audioPause();
    transcriptInterrupt.current = true;
    gameStarted.current = false;
    forestObstacleProgress.current = 0;
    obstacleStamina.current = 5;
    await new Promise((resolve) => setTimeout(resolve, 300));
    delayedPosition.current = 0;
    if (restart) {
      postTextToConsole("Starting game from the beginning.", "Console");
      transcriptInterrupt.current = false;
      startGame();
    } else {
      postTextToConsole("Game session ended.", "Console");
    }
  }
  async function tutorialQuestion() {
    if (gameStarted.current === true) {
      postTextToConsole("The game is already started", "Console");
      return;
    }
    gameStarted.current = true;
    postTextToConsole("Would you like to go to the tutorial? Say yes or no", "");
    await new Promise((resolve) => setTimeout(resolve, 7e3));
    playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
    waitingForUserInput.current = "TutorialQuestion";
  }
  async function tutorial() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      postTextToConsole("Welcome to the tutorial. Throughout this experience, you will be able to give voice inputs to decide your actions in the game. You will be prompted to give voice inputs by this sound effect.", "");
      await new Promise((resolve2) => setTimeout(resolve2, 12e3));
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      await new Promise((resolve2) => setTimeout(resolve2, 1e3));
      postTextToConsole("This game has many different commands to control the experience. These include but are notlimited to. Rewind, speed up, slow down, pause and play. You can call these commandsat any time. If you wish to learn about any of these commandsplease say `help` for more information", "");
      postTextToConsole("In this game you will fight many enemies in battle. These battles are turn based. In battle you have four moves, slash, stab, parry slash and parry stab. Slash is a standard attack that can be parried withparry slash, stab is a move that you charge up on your initial turn and can then either go throughwith it  on your next turn and do lots of damage to your opponent or you can switch to slash to trick your opponent. Be wary however as if your opponent predicts this and picks parry slash then you will then be stunned andmiss a turn. The same goes for if your opponent predicts you follow through and they pick parry stab. This makes stab a risky move but with high reward.", "");
      postTextToConsole("If you want to hear that again mid game, say help combat to hear that again", "");
      postTextToConsole("Would you like to hear the tutorial again? Say yes or no", "");
      await new Promise((resolve2) => setTimeout(resolve2, 68e3));
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      waitingForUserInput.current = "TutorialQuestion";
      resolve();
    });
  }
  let gameStarted = useRef(false);
  let cancelGame;
  async function startGame() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      audioRef.current.src = "./src/Audio/Narration/Intro.mp3";
      transcriptOutput("Intro");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      audioRef.current.src = "./src/Audio/Narration/forestIntro.mp3";
      transcriptOutput("forestIntro");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      waitingForUserInput.current = "Forest";
      await new Promise((resolve2) => setTimeout(resolve2, 300));
      postTextToConsole("Choose your path. Do you want to go left or right?", "");
      await new Promise((resolve2) => setTimeout(resolve2, 4e3));
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      resolve();
    });
  }
  async function debugGame() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      postTextToConsole("debug game started", "");
      startCombat();
      resolve();
    });
  }
  async function riddleStart() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      audioRef.current.src = "./src/Audio/Narration/riddleIntro.mp3";
      transcriptOutput("riddleIntro");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      postTextToConsole("Do you want to look left, right, up, or down?", "");
      waitingForUserInput.current = "riddleStart";
      await new Promise((resolve2) => setTimeout(resolve2, 4e3));
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      resolve();
    });
  }
  async function riddleSearchWrong() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      waitingForUserInput.current = "";
      audioRef.current.src = "./src/Audio/Narration/notHere.mp3";
      transcriptOutput("notHere");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      waitingForUserInput.current = "riddleStart";
      resolve();
    });
  }
  async function riddleFound() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      waitingForUserInput.current = "";
      audioRef.current.src = "./src/Audio/Narration/ahRiddle.mp3";
      transcriptOutput("ahRiddle");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      audioRef.current.src = "./src/Audio/Narration/riddle.mp3";
      transcriptOutput("riddle");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      waitingForUserInput.current = "Riddle";
      resolve();
    });
  }
  async function riddleDoorOpen() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      waitingForUserInput.current = "";
      audioRef.current.src = "./src/Audio/Narration/openDoor.mp3";
      transcriptOutput("openDoor");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      finale();
      resolve();
    });
  }
  async function finale() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      audioRef.current.src = "./src/Audio/Narration/finale.mp3";
      transcriptOutput("finale");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      opponent.current = 2;
      startCombat();
      resolve();
    });
  }
  async function ending() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      await new Promise((resolve2) => setTimeout(resolve2, 4e3));
      audioRef.current.src = "./src/Audio/Narration/ending.mp3";
      transcriptOutput("ending");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      postTextToConsole("You just finished Toxic Rōnin", "");
      endGame();
      resolve();
    });
  }
  async function forestLeft() {
    postTextToConsole("You picked 'left'", "");
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      audioRef.current.src = "./src/Audio/Narration/forestFight.mp3";
      transcriptOutput("forestFight");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      opponent.current = 1;
      startCombat();
      resolve();
    });
  }
  const forestObstacleOrder = ["crouch", "crouch", "crouch", "jump", "crouch", "jump"];
  let forestObstacleProgress = useRef(0);
  let obstacleStamina = useRef(5);
  async function forestRight() {
    postTextToConsole("You picked 'right'", "");
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      audioRef.current.src = "./src/Audio/Narration/forestObstacle.mp3";
      transcriptOutput("forestObstacle");
      audioStart();
      await new Promise(async (resolve2) => {
        storyBlock = resolve2;
      });
      waitingForUserInput.current = "forestObstacle";
      postTextToConsole(`Say crouch, or jump in line with Musashis guess. Say "hint" in order to hear the dialogue again`, "");
      await new Promise((resolve2) => setTimeout(resolve2, 7e3));
      playSoundEffect("src/Audio/Game Sounds/notification-sound.mp3");
      resolve();
    });
  }
  async function startCombat() {
    await new Promise(async (resolve, reject) => {
      cancelGame = reject;
      musicAudio.current.play();
      postTextToConsole("You have entered battle!", "");
      postTextToConsole("Use the help combat command to learn about combat", "");
      playerHealth.current = 100;
      enemyHealth.current = 100;
      firstTurn.current = true;
      waitingForUserInput.current = "Combat";
      postTextToConsole("Pick your first move!", "");
      resolve();
    });
  }
  let playerHealth = useRef(100);
  let enemyHealth = useRef(100);
  let stunned = useRef(0);
  let playerChargingStab = useRef(false);
  let enemyChargingStab = useRef(false);
  const cTextPlayerParrySuccess = "You predicted the enemy and parried their attack!";
  const cTextEnemyParrySuccess = "The enemy predicted you and parried your attack!";
  const cTextPlayerStunned = "You are stunned for the next turn!";
  const cTextEnemyStunned = "The enemy is stunned for the next turn!";
  const cTextPlayerStabCharge = "You pull back your sword and strengthen your stance in preparation to stab your opponent next turn!";
  const cTextEnemyStabCharge = "The enemy pulls his sword back and strengthens his stance in preparation to stab you next turn!";
  let firstTurn = useRef(true);
  async function combatMove(movePicked) {
    const enemyMovePicked = enemyMoveAI();
    if (stunned.current === 1) {
      stunned.current = 0;
    }
    console.log(`enemy move picked ${enemyMovePicked}`);
    if (movePicked === "slash" && enemyMovePicked === "parry slash") {
      if (playerChargingStab.current) {
        stunned.current = 1;
        postTextToConsole(cTextEnemyParrySuccess, "");
        postTextToConsole(cTextPlayerStunned, "");
        postTextToConsole("You were stunned and so your move was skipped!", "");
        combatMove("");
        return;
      } else {
        postTextToConsole(cTextEnemyParrySuccess, "");
        return;
      }
    } else if (movePicked === "stab" && enemyMovePicked === "parry stab" && playerChargingStab.current) {
      stunned.current = 1;
      playerChargingStab.current = false;
      postTextToConsole(cTextEnemyParrySuccess, "");
      postTextToConsole(cTextPlayerStunned, "");
      postTextToConsole("You were stunned and so your move was skipped!", "");
      combatMove("");
      return;
    }
    if (movePicked === "parry slash" && enemyMovePicked === "slash") {
      if (enemyChargingStab.current) {
        stunned.current = 2;
        postTextToConsole(cTextPlayerParrySuccess, "");
        postTextToConsole(cTextEnemyStunned, "");
        return;
      } else {
        postTextToConsole(cTextPlayerParrySuccess, "");
        return;
      }
    } else if (movePicked === "parry stab" && enemyMovePicked === "stab" && enemyChargingStab.current === true) {
      stunned.current = 2;
      enemyChargingStab.current = false;
      postTextToConsole(cTextPlayerParrySuccess, "");
      postTextToConsole(cTextEnemyStunned, "");
      return;
    }
    if (movePicked !== "stab") {
      playerChargingStab.current = false;
    }
    if (enemyMovePicked !== "stab") {
      enemyChargingStab.current = false;
    }
    let damage = 0;
    if (movePicked === "slash") {
      damage = 30;
      playerChargingStab.current = false;
      playSoundEffect("src/Audio/Game Sounds/sword-clash.mp3");
    } else if (movePicked === "stab" && playerChargingStab.current === true) {
      damage = 70;
      playerChargingStab.current = false;
    } else if (movePicked === "stab") {
      postTextToConsole(cTextPlayerStabCharge, "");
      playerChargingStab.current = true;
    }
    let damageMessage = ` and did ${damage} damage`;
    if (!playerChargingStab.current && movePicked !== "") {
      postTextToConsole(`You picked ${movePicked}${damageMessage}!`, "");
    }
    enemyHealth.current -= damage;
    if (enemyHealth.current <= 0) {
      waitingForUserInput.current = "";
      postTextToConsole("You killed your foe and won the fight!", "");
      if (opponent.current === 1) {
        riddleStart();
      } else if (opponent.current === 2) {
        ending();
      }
      musicAudio.current.currentTime = 0;
      musicAudio.current.pause();
      playSoundEffect("src/Audio/Game Sounds/male-death-sound.mp3");
      return;
    }
    damage = 0;
    if (enemyMovePicked === "slash") {
      damage = 30;
      enemyChargingStab.current = false;
    } else if (enemyMovePicked === "stab" && enemyChargingStab.current === true) {
      damage = 70;
      enemyChargingStab.current = false;
    } else if (enemyMovePicked === "stab") {
      postTextToConsole(cTextEnemyStabCharge, "");
      enemyChargingStab.current = true;
    }
    damageMessage = ` and did ${damage} damage`;
    if (!enemyChargingStab.current && stunned.current !== 2) {
      postTextToConsole(`The enemy picked ${enemyMovePicked}${damageMessage}!`, "");
    }
    playerHealth.current -= damage;
    if (playerHealth.current <= 0) {
      playSoundEffect("src/Audio/Game Sounds/male-death-sound.mp3");
      postTextToConsole("You have been killed and lost the fight. Game over.", "");
      waitingForUserInput.current = "";
      await new Promise((resolve) => setTimeout(resolve, 15e3));
      endGame(true);
      musicAudio.current.currentTime = 0;
      musicAudio.current.pause();
      return;
    }
    if (stunned.current === 2) {
      postTextToConsole("The enemy was stunned and so their move was skipped!", "");
      stunned.current = 0;
    }
    postTextToConsole(`You have ${playerHealth.current} health remaining and the enemy has ${enemyHealth.current} remaining!`, "");
  }
  function enemyMoveAI() {
    if (firstTurn.current) {
      firstTurn.current = false;
      console.log("ENEMY AI : first turn");
      return randomMove(1, 3);
    }
    if (stunned.current === 2) {
      console.log("ENEMY AI : enemy stunned");
      return "";
    } else if (playerChargingStab.current) {
      console.log("ENEMY AI : player charging stab");
      return randomMove(3, 4);
    } else if (enemyChargingStab.current) {
      console.log("ENEMY AI : enemy charging stab");
      return randomMove(1, 2);
    } else if (stunned.current === 1) {
      console.log("ENEMY AI : player stunned");
      return "slash";
    }
    console.log("ENEMY AI : no match. Random move");
    return randomMove(1, 4);
    function randomMove(min, max) {
      const enemyMoveNum = Math.floor(Math.random() * (max - min + 1)) + min;
      switch (enemyMoveNum) {
        case 1:
          return "slash";
        case 2:
          return "stab";
        case 3:
          return "parry slash";
        case 4:
          return "parry stab";
      }
    }
  }
  async function transcriptOutput(transcriptName) {
    if (isTranscriptRunning.current) {
      return;
    }
    isTranscriptRunning.current = true;
    let transcriptText;
    transcriptNameRef.current = transcriptName;
    for (const [key, value] of Object.entries(transcripts)) {
      if (key === transcriptName) {
        transcriptText = value;
      }
    }
    let delayedTranscript = "";
    let char = "";
    let transcriptDelayTimer;
    let transcriptCharacterDelayTimer;
    for (let i = delayedPosition.current; i < transcriptText.length; i++) {
      char = transcriptText[i];
      transcriptDelayTimer = 1e3 / audioSpeed.current;
      transcriptCharacterDelayTimer = 90 / audioSpeed.current;
      if (transcriptInterrupt.current === false) {
        if (char === "^") {
          await new Promise((resolve) => setTimeout(resolve, transcriptDelayTimer));
        } else if (char === " ") {
          await new Promise((resolve) => setTimeout(resolve, 0));
          delayedTranscript += char;
        } else {
          await new Promise((resolve) => setTimeout(resolve, transcriptCharacterDelayTimer));
          delayedTranscript += char;
        }
        transcriptRef.current.innerHTML = delayedTranscript;
      } else {
        transcriptRef.current.innerHTML = "";
        postTextToConsole(delayedTranscript, "", true);
        delayedPosition.current = i;
        if (transcriptRewindSeconds.current !== 0) {
          let timeAddition = 0;
          for (let i2 = delayedPosition.current; i2 >= 0; i2--) {
            if (transcriptText[i2] === "^") {
              timeAddition += transcriptDelayTimer;
            }
            if (transcriptText[i2] === " ") ;
            else {
              timeAddition += transcriptCharacterDelayTimer;
            }
            if (timeAddition >= transcriptRewindSeconds.current * 1e3) {
              delayedPosition.current = i2;
              break;
            }
          }
          if (timeAddition < transcriptRewindSeconds.current * 1e3) {
            delayedPosition.current = 0;
          }
        }
        break;
      }
    }
    if (transcriptInterrupt.current === false) {
      transcriptRef.current.innerHTML = "";
      postTextToConsole(delayedTranscript, "", true);
      delayedPosition.current = 0;
      isTranscriptRunning.current = false;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      checkStoryBlock();
    } else {
      transcriptInterrupt.current = false;
      isTranscriptRunning.current = false;
    }
    if (transcriptRewindSeconds.current !== 0) {
      transcriptRewindSeconds.current = 0;
      transcriptOutput(transcriptName);
    }
  }
  return /* @__PURE__ */ jsx(Fragment, {});
}
function Play() {
  const consoleRef = useRef();
  const transcriptRef = useRef();
  const [commandToGameTrigger, setCommandToGameTrigger] = useState(true);
  const consoleToGameCommandRef = useRef("");
  function postGameLogicToConsole(message, speaker, isTranscript) {
    if (consoleRef.current) {
      consoleRef.current.callPostToConsole(message, speaker, isTranscript);
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Banner, {}),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Features, {}),
    /* @__PURE__ */ jsx(Story, {}),
    /* @__PURE__ */ jsx(
      Console,
      {
        ref: consoleRef,
        transcriptRef,
        commandToGameTrigger,
        setCommandToGameTrigger,
        consoleToGameCommandRef
      }
    ),
    /* @__PURE__ */ jsx(
      GameLogic,
      {
        transcriptRef,
        postTextToConsole: postGameLogicToConsole,
        commandToGameTrigger,
        setCommandToGameTrigger,
        consoleToGameCommandRef
      }
    )
  ] });
}
function UserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/site/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch stats.");
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("p", { children: "Loading stats..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("p", { children: [
      "Error loading stats: ",
      error
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Banner, {}),
    /* @__PURE__ */ jsx("h1", { style: { textAlign: "center" }, children: "User Stats" }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsx("div", { className: "statsContainer", children: /* @__PURE__ */ jsxs("div", { className: "timePlayed", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Seconds Played" }),
      /* @__PURE__ */ jsx("h4", { children: stats.stats.totalTimePlayed })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Number of Players" }),
        /* @__PURE__ */ jsx("h4", { children: stats.totalUsers })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Most Active Player" }),
        /* @__PURE__ */ jsxs("h4", { className: "text-uppercase", children: [
          stats.mostPlayed.name,
          " | ",
          stats.mostPlayed.timePlayed
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Total Game Completions" }),
        /* @__PURE__ */ jsx("h4", { children: stats.stats.totalGameCompletions })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Total Deaths" }),
        /* @__PURE__ */ jsx("h4", { children: stats.stats.totalNumberOfDeaths })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-uppercase", children: [
          "Riddle Guesses: ",
          stats.stats.totalRiddleGuesses
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-success", children: [
          "Correct: ",
          stats.stats.totalRiddleGuessesCorrect
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-danger", children: [
          "Incorrect: ",
          stats.stats.totalRiddleGuessesIncorrect
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-uppercase", children: [
          "Forest Path Choices: ",
          stats.stats.totalPathChoices
        ] }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Chose to Fight: ",
          stats.stats.totalPathChoicesLeft
        ] }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Chose to Traverse: ",
          stats.stats.totalPathChoicesRight
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Audio Files Played" }),
        /* @__PURE__ */ jsx("h4", { children: stats.stats.totalAudioPlayed })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Commands Used" }),
        /* @__PURE__ */ jsx("h4", { children: stats.stats.totalCommandsUsed })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Audio File Play Count" }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "hit: ",
          stats.stats.totalHit
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "miss: ",
          stats.stats.totalMiss
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "damaged: ",
          stats.stats.totalDamaged
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "stamina: ",
          stats.stats.totalStamina
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "eating: ",
          stats.stats.totalEating
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "death: ",
          stats.stats.totalDeath
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Command Usage" }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Start Game: ",
          stats.stats.totalStartGame
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Repeat: ",
          stats.stats.totalRepeat
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Pause: ",
          stats.stats.totalPause
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "End Game: ",
          stats.stats.totalEndGame
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Speed Up: ",
          stats.stats.totalSpeedUp
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Slow Down: ",
          stats.stats.totalSlowDown
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Restart: ",
          stats.stats.totalRestart
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Clear: ",
          stats.stats.totalClear
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Rewind: ",
          stats.stats.totalRewind
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Help: ",
          stats.stats.totalHelp
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "statsContainer", children: /* @__PURE__ */ jsxs("div", { className: "statSectionHeatmap", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-uppercase", children: "Heatmap" }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"
        }
      )
    ] }) })
  ] });
}
function MyStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/user/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch stats.");
        }
        const data = await response.json();
        setStats(data.stats);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("p", { children: "Loading stats..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("p", { children: [
      "Error loading stats: ",
      error
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Banner, {}),
    /* @__PURE__ */ jsx("h1", { style: { textAlign: "center" }, children: "My Stats" }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsx("div", { className: "statsContainer", children: /* @__PURE__ */ jsxs("div", { className: "timePlayed", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Seconds Played" }),
      /* @__PURE__ */ jsx("h4", { children: stats.timePlayed })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Total Game Completions" }),
        /* @__PURE__ */ jsx("h4", { children: stats.gameCompletions })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Total Deaths" }),
        /* @__PURE__ */ jsx("h4", { children: stats.numberOfDeaths })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-uppercase", children: [
          "Riddle Guesses: ",
          stats.totalRiddleGuesses
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-success", children: [
          "Correct: ",
          stats.riddleGuesses.correct
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-danger", children: [
          "Incorrect: ",
          stats.riddleGuesses.incorrect
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-uppercase", children: [
          "Forest Path Choices: ",
          stats.totalPathChoices
        ] }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Chose to Fight: ",
          stats.pathChoices.left
        ] }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Chose to Traverse: ",
          stats.pathChoices.right
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Audio Files Played" }),
        /* @__PURE__ */ jsx("h4", { children: stats.totalAudioPlayed })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Commands Used" }),
        /* @__PURE__ */ jsx("h4", { children: stats.totalCommandsUsed })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "statsContainer", children: [
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Audio File Play Count" }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "hit: ",
          stats.audioFiles.hit
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "miss: ",
          stats.audioFiles.miss
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "damaged: ",
          stats.audioFiles.damaged
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "stamina: ",
          stats.audioFiles.stamina
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "eating: ",
          stats.audioFiles.eating
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "death: ",
          stats.audioFiles.death
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "statSection", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-uppercase", children: "Command Usage" }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Start Game: ",
          stats.commands.startGame
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Repeat: ",
          stats.commands.repeat
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Pause: ",
          stats.commands.pause
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "End Game: ",
          stats.commands.endGame
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Speed Up: ",
          stats.commands.speedUp
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Slow Down: ",
          stats.commands.slowDown
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Restart: ",
          stats.commands.restart
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Clear: ",
          stats.commands.clear
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Rewind: ",
          stats.commands.rewind
        ] }),
        /* @__PURE__ */ jsxs("h4", { children: [
          "Help: ",
          stats.commands.help
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "statsContainer", children: /* @__PURE__ */ jsxs("div", { className: "statSectionHeatmap", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-uppercase", children: "Heatmap" }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"
        }
      )
    ] }) })
  ] });
}
const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const onSubmit = async (data, e) => {
    e.preventDefault();
    try {
      setLoginError("");
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
        // Important for cookies/session
      });
      const result = await response.json();
      if (result.success) {
        console.log("Login successful, redirecting to:", result.redirect);
        window.location.href = result.redirect;
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError("An error occurred while logging in. Please try again.");
      console.error("Error:", error);
    }
  };
  const formSubmit = handleSubmit((data, e) => {
    e.preventDefault();
    onSubmit(data, e);
  });
  return /* @__PURE__ */ jsx("div", { className: "container mt-5", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h3", { className: "card-title text-center mb-3", children: "Login" }),
    /* @__PURE__ */ jsx("div", { className: "text-center mb-4", children: /* @__PURE__ */ jsx("img", { src: "/assets/Logo_2.png", alt: "Logo", className: "img-fluid logo" }) }),
    loginError && /* @__PURE__ */ jsx("div", { className: "alert alert-danger", role: "alert", children: loginError }),
    /* @__PURE__ */ jsxs("form", { onSubmit: formSubmit, noValidate: true, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "username", children: "Username" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: `form-control ${errors.username ? "is-invalid" : ""}`,
            id: "username",
            placeholder: "Enter username",
            ...register("username", { required: "Username is required" })
          }
        ),
        errors.username && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: errors.username.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            className: `form-control ${errors.password ? "is-invalid" : ""}`,
            id: "password",
            placeholder: "Password",
            ...register("password", { required: "Password is required" })
          }
        ),
        errors.password && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "btn btn-primary w-100",
          children: "Login"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center mt-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-secondary w-100",
          onClick: () => navigate("/signup"),
          children: "Create an account or sign up now!"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "forgot-password-link",
          onClick: () => navigate("/forgot-password"),
          children: "Forgot your password? Reset it here!"
        }
      ) })
    ] })
  ] }) }) }) }) });
};
const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [signupError, setSignupError] = useState("");
  const onSubmit = async (data) => {
    try {
      setSignupError("");
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirect;
      } else {
        setSignupError(result.message);
      }
    } catch (error) {
      setSignupError("An error occurred during signup. Please try again.");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "container mt-5", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h3", { className: "card-title text-center mb-3", children: "Sign Up" }),
    signupError && /* @__PURE__ */ jsx("div", { className: "alert alert-danger", children: signupError }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), noValidate: true, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            className: `form-control ${errors.name ? "is-invalid" : ""}`,
            ...register("name", { required: "Name is required" })
          }
        ),
        errors.name && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: errors.name.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            className: `form-control ${errors.email ? "is-invalid" : ""}`,
            ...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format"
              }
            })
          }
        ),
        errors.email && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: errors.email.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "password",
            className: `form-control ${errors.password ? "is-invalid" : ""}`,
            ...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long"
              }
            })
          }
        ),
        errors.password && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary w-100", children: "Sign Up" })
    ] })
  ] }) }) }) }) });
};
function TTSSettings() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem("ttsVoice") || ""
  );
  const [pitch, setPitch] = useState(
    parseFloat(localStorage.getItem("ttsPitch")) || 1
  );
  const [rate, setRate] = useState(
    parseFloat(localStorage.getItem("ttsRate")) || 1
  );
  const [volume, setVolume] = useState(
    parseFloat(localStorage.getItem("ttsVolume")) || 1
  );
  const [ttsEnabled, setTtsEnabled] = useState(
    localStorage.getItem("ttsEnabled") === "true" || false
  );
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(getAvailableVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    setVoices(getAvailableVoices());
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);
  useEffect(() => {
    setUserTTSPreferences({
      voiceName: selectedVoice,
      pitch,
      rate,
      volume,
      enabled: ttsEnabled
    });
  }, [selectedVoice, pitch, rate, volume, ttsEnabled]);
  return /* @__PURE__ */ jsx("div", { className: "card mb-6 p-4 border border-gray-200 rounded-md shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h2", { className: "card-title text-xl font-semibold mb-2", children: "Text-to-Speech" }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "ttsEnabledCheckbox", children: "Enable Text-to-Speech" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "ttsEnabledCheckbox",
          type: "checkbox",
          checked: ttsEnabled,
          onChange: (e) => setTtsEnabled(e.target.checked),
          className: "form-check-input"
        }
      )
    ] }),
    ttsEnabled && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "ttsVoiceSelect", children: "Voice" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "ttsVoiceSelect",
            value: selectedVoice,
            onChange: (e) => setSelectedVoice(e.target.value),
            className: "form-select",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "System Default" }),
              voices.map((voice) => /* @__PURE__ */ jsxs("option", { value: voice.name, children: [
                voice.name,
                " (",
                voice.lang,
                ")"
              ] }, voice.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "pitchRange", children: [
          "Pitch: ",
          pitch.toFixed(1)
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "pitchRange",
            type: "range",
            min: "0",
            max: "2",
            step: "0.01",
            value: pitch,
            onChange: (e) => setPitch(parseFloat(e.target.value)),
            className: "form-range"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "rateRange", children: [
          "Rate: ",
          rate.toFixed(1)
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "rateRange",
            type: "range",
            min: "0.5",
            max: "2",
            step: "0.01",
            value: rate,
            onChange: (e) => setRate(parseFloat(e.target.value)),
            className: "form-range"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "volumeRange", children: [
          "Volume: ",
          volume.toFixed(1)
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "volumeRange",
            type: "range",
            min: "0",
            max: "1",
            step: "0.01",
            value: volume,
            onChange: (e) => setVolume(parseFloat(e.target.value)),
            className: "form-range"
          }
        )
      ] })
    ] })
  ] }) });
}
const linearToDecibels = (linear) => 20 * Math.log10(linear);
const activeAudioElements = /* @__PURE__ */ new Set();
function updateEqualizerSettings(equalizerSettings) {
  activeAudioElements.forEach((audio) => {
    if (audio._filters) {
      const { bassFilter, midFilter, trebleFilter } = audio._filters;
      bassFilter.gain.value = linearToDecibels(equalizerSettings.bass);
      midFilter.gain.value = linearToDecibels(equalizerSettings.mid);
      trebleFilter.gain.value = linearToDecibels(equalizerSettings.treble);
    }
  });
}
function setUserAudioPreferences({ masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume, equalizerSettings }) {
  try {
    if (typeof masterVolume === "number") {
      localStorage.setItem("masterVolume", masterVolume.toString());
    }
    if (typeof soundEffectVolume === "number") {
      localStorage.setItem("soundEffectVolume", soundEffectVolume.toString());
    }
    if (typeof voiceDialogueVolume === "number") {
      localStorage.setItem("voiceDialogueVolume", voiceDialogueVolume.toString());
    }
    if (typeof musicVolume === "number") {
      localStorage.setItem("musicVolume", musicVolume.toString());
    }
    if (equalizerSettings) {
      localStorage.setItem("equalizerSettings", JSON.stringify(equalizerSettings));
      updateEqualizerSettings(equalizerSettings);
    }
  } catch (error) {
    console.error("Failed to set user audio preferences:", error);
  }
}
function getEqualizerSettings() {
  try {
    const storedEqualizerSettings = localStorage.getItem("equalizerSettings");
    return storedEqualizerSettings ? JSON.parse(storedEqualizerSettings) : { bass: 1, mid: 1, treble: 1 };
  } catch (error) {
    console.error("Failed to get equalizer settings:", error);
    return { bass: 1, mid: 1, treble: 1 };
  }
}
function AudioSettings() {
  const [masterVolume, setMasterVolume] = useState(
    parseFloat(localStorage.getItem("masterVolume")) || 1
  );
  const [soundEffectVolume, setSoundEffectVolume] = useState(
    parseFloat(localStorage.getItem("soundEffectVolume")) || 1
  );
  const [voiceDialogueVolume, setVoiceDialogueVolume] = useState(
    parseFloat(localStorage.getItem("voiceDialogueVolume")) || 1
  );
  const [musicVolume, setMusicVolume] = useState(
    parseFloat(localStorage.getItem("musicVolume")) || 1
  );
  const [equalizerSettings, setEqualizerSettings] = useState(getEqualizerSettings());
  const debouncedSetUserAudioPreferences = useCallback(
    debounce((preferences) => {
      setUserAudioPreferences(preferences);
    }, 300),
    // 300ms debounce delay; adjust as needed
    []
  );
  useEffect(() => {
    debouncedSetUserAudioPreferences({
      masterVolume,
      soundEffectVolume,
      voiceDialogueVolume,
      musicVolume,
      equalizerSettings
    });
    return () => {
      debouncedSetUserAudioPreferences.cancel();
    };
  }, [masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume, equalizerSettings, debouncedSetUserAudioPreferences]);
  return /* @__PURE__ */ jsx("div", { className: "card mb-6 p-4 border border-gray-200 rounded-md shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h2", { className: "card-title text-xl font-semibold mb-4", children: "General Audio" }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "masterVolumeRange", children: [
        "Master Volume: ",
        (masterVolume * 100).toFixed(0),
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "masterVolumeRange",
          type: "range",
          min: "0",
          max: "1",
          step: "0.01",
          value: masterVolume,
          onChange: (e) => setMasterVolume(parseFloat(e.target.value)),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "soundEffectVolumeRange", children: [
        "Sound Effect Volume: ",
        (soundEffectVolume * 100).toFixed(0),
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "soundEffectVolumeRange",
          type: "range",
          min: "0",
          max: "1",
          step: "0.01",
          value: soundEffectVolume,
          onChange: (e) => setSoundEffectVolume(parseFloat(e.target.value)),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "voiceDialogueVolumeRange", children: [
        "Dialogue Volume: ",
        (voiceDialogueVolume * 100).toFixed(0),
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "voiceDialogueVolumeRange",
          type: "range",
          min: "0",
          max: "1",
          step: "0.01",
          value: voiceDialogueVolume,
          onChange: (e) => setVoiceDialogueVolume(parseFloat(e.target.value)),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "musicVolumeRange", children: [
        "Music Volume: ",
        (musicVolume * 100).toFixed(0),
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "musicVolumeRange",
          type: "range",
          min: "0",
          max: "1",
          step: "0.01",
          value: musicVolume,
          onChange: (e) => setMusicVolume(parseFloat(e.target.value)),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "card-title text-xl font-semibold mb-4", children: "Equalizer Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "bassRange", children: [
        "Bass (60Hz): ",
        equalizerSettings.bass.toFixed(1),
        " dB (decibels)"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "bassRange",
          type: "range",
          min: "-12",
          max: "12",
          step: "0.1",
          value: equalizerSettings.bass,
          onChange: (e) => setEqualizerSettings({ ...equalizerSettings, bass: parseFloat(e.target.value) }),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "midRange", children: [
        "Mid (1kHz): ",
        equalizerSettings.mid.toFixed(1),
        " dB (decibels)"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "midRange",
          type: "range",
          min: "-12",
          max: "12",
          step: "0.1",
          value: equalizerSettings.mid,
          onChange: (e) => setEqualizerSettings({ ...equalizerSettings, mid: parseFloat(e.target.value) }),
          className: "form-range"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group mb-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", htmlFor: "trebleRange", children: [
        "Treble (10kHz): ",
        equalizerSettings.treble.toFixed(1),
        " dB (decibels)"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "trebleRange",
          type: "range",
          min: "-12",
          max: "12",
          step: "0.1",
          value: equalizerSettings.treble,
          onChange: (e) => setEqualizerSettings({ ...equalizerSettings, treble: parseFloat(e.target.value) }),
          className: "form-range"
        }
      )
    ] })
  ] }) });
}
function SettingsPage() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Banner, {}),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto p-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6", children: "Settings" }),
      /* @__PURE__ */ jsx(AudioSettings, {}),
      /* @__PURE__ */ jsx(TTSSettings, {})
    ] })
  ] });
}
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "container mt-5", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h3", { className: "card-title text-center mb-3", children: "Forgot Password" }),
    message && /* @__PURE__ */ jsx("div", { className: "alert alert-info", children: message }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Enter your email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            className: "form-control",
            placeholder: "Enter your registered email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary w-100", children: "Send Reset Link" })
    ] })
  ] }) }) }) }) });
};
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  console.log("Token in ResetPassword:", token);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch(`/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok && result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "container mt-5", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
    /* @__PURE__ */ jsx("h3", { className: "card-title text-center mb-3", children: "Reset Password" }),
    message && /* @__PURE__ */ jsx("div", { className: "alert alert-info", children: message }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "New Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "password",
            className: "form-control",
            placeholder: "Enter new password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", children: "Confirm New Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "confirmPassword",
            className: "form-control",
            placeholder: "Confirm new password",
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary w-100", children: "Reset Password" })
    ] })
  ] }) }) }) }) });
};
function Error404() {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("h1", { children: "Error 404 Page Not Found" }) });
}
const App = () => {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/play", element: /* @__PURE__ */ jsx(Play, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/my-stats", element: /* @__PURE__ */ jsx(MyStats, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/user-stats", element: /* @__PURE__ */ jsx(UserStats, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(Login, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/signup", element: /* @__PURE__ */ jsx(SignUp, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/settings", element: /* @__PURE__ */ jsx(SettingsPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/forgot-password", element: /* @__PURE__ */ jsx(ForgotPassword, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/reset-password", element: /* @__PURE__ */ jsx(ResetPassword, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/404", element: /* @__PURE__ */ jsx(Error404, {}) })
  ] });
};
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) })
  );
}
export {
  render
};
