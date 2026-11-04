const requested = new Set<string>();

/**
 * Load an ES module from `src` (a file under public/) once per page, however many
 * components ask for it. The diagram web components register their custom
 * elements this way, so their bundles load only on posts that have a diagram.
 */
export function loadModuleScript(src: string) {
  if (typeof document === "undefined" || requested.has(src)) return;
  requested.add(src);
  const script = document.createElement("script");
  script.type = "module";
  script.src = src;
  document.head.append(script);
}
