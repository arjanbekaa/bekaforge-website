const settingsSurfaceIds = new Set([
  "text",
  "choices",
  "audio",
  "runtime-ui",
  "graph-ai",
  "graph-editor",
  "themes",
  "about"
]);

const mainTabSurface = {
  home: "home",
  graphs: "graph-editor",
  definitions: "definitions",
  production: "production",
  health: "project-health"
};

export function surfaceForMainTab(tab, settingsCategory = "text") {
  if (tab === "settings") {
    const category = settingsSurfaceIds.has(settingsCategory) ? settingsCategory : "text";
    return `settings-${category}`;
  }
  return mainTabSurface[tab] || "";
}

export function withSurface(href, surface) {
  const url = new URL(href);
  if (surface) url.searchParams.set("surface", surface);
  else url.searchParams.delete("surface");
  return url.toString();
}
