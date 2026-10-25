/*
  Beka Forge public website resources.
  Defaults keep the site usable. Public values in site-config.json can override
  whitelisted fields after the page loads from GitHub Pages.
*/
(function () {
  "use strict";

  const resources = {
    publisher: {
      name: "Beka Forge",
      positioning: "Unity tools publisher",
      assetStoreUrl: "https://assetstore.unity.com/publishers/121154",
      youtubeUrl: "https://www.youtube.com/@BekaForge",
      githubUrl: "https://github.com/arjanbekaa/bekaforge-website"
    },
    support: {
      emailUrl: "mailto:bekaforge@gmail.com",
      reportIssueUrl: "https://github.com/arjanbekaa/bekaforge-website/issues/new/choose"
    },
    documentation: {
      "getting-started": "https://bekaforge.com/Dialogue%20Graph%20System/getting-started.html",
      "dialogue-runtime": "https://bekaforge.com/Dialogue%20Graph%20System/modules/runtime-dialog-flow.html",
      actions: "https://bekaforge.com/Dialogue%20Graph%20System/guides/integrating-actions.html",
      history: "https://bekaforge.com/Dialogue%20Graph%20System/modules/history-and-transcripts.html",
      localization: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#localization",
      "ui-themes": "https://bekaforge.com/Dialogue%20Graph%20System/modules/settings-system.html",
      variables: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#variable-definition",
      "dialogue-graphs": "https://bekaforge.com/Dialogue%20Graph%20System/modules/graph-editor.html",
      characters: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#asset-character",
      banter: "https://bekaforge.com/Dialogue%20Graph%20System/guides/banter-setup.html",
      audio: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#asset-voice-table",
      delivery: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#asset-delivery-preset",
      "scene-context": "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#asset-scene-context",
      branding: "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#asset-welcome-branding",
      "runtime-ui": "https://bekaforge.com/Dialogue%20Graph%20System/components/runtime-ui.html",
      settings: "https://bekaforge.com/Dialogue%20Graph%20System/modules/settings-system.html",
      "camera-controller": "https://bekaforge.com/Dialogue%20Graph%20System/guides/camera-interaction-ui.html",
      interaction: "https://bekaforge.com/Dialogue%20Graph%20System/guides/camera-interaction-ui.html",
      walla: "https://bekaforge.com/Dialogue%20Graph%20System/guides/walla-setup.html",
      "ai-extension": "https://bekaforge.com/Dialogue%20Graph%20System/guides/ai-generation-workflow.html",
      upgrade: "https://bekaforge.com/Dialogue%20Graph%20System/installation.html#upgrade"
    },
    labels: {
      docs: "Open documentation",
      video: "Watch video",
      store: "View on Asset Store",
      getFree: "View AI Providers listing",
      report: "Report a website issue"
    },
    paths: {
      docsHub: "docs.html",
      roadmap: "roadmap.html",
      dgsDocs: "Dialogue Graph System/index.html",
      aiExtensionDocs: "Dialogue Graph System/guides/ai-generation-workflow.html",
      aiProvidersDocs: "AI Providers/index.html",
      dgsScreenshot: "Dialogue Graph System/4.0/screenshots/clean/graph-far.png",
      dgsIcon: "Dialogue Graph System/brand/icone 1254x1254.png",
      aiExtensionScreenshot: "Dialogue Graph AI Extension/brand/ai-extension-card-420x280.png",
      aiExtensionIcon: "Dialogue Graph AI Extension/brand/ai-extension-icon-160x160.png",
      aiProvidersScreenshot: "AI Providers/brand/ai-providers-card-420x280.png",
      aiProvidersIcon: "AI Providers/brand/ai-providers-icon-1254x1254.png"
    },
    products: {
      dialogueGraphSystem: {
        name: "Dialogue Graph System",
        slug: "dialogue-graph-system",
        shortName: "DGS",
        status: "4.0 documentation prepared · release not published",
        price: "",
        version: "4.0.0",
        description: "One Unity dialogue authoring and runtime package, including Core, Banter, Sound/Walla, AI Extension, Camera Controller, and Interaction.",
        docsPath: "Dialogue Graph System/index.html",
        screenshotPath: "Dialogue Graph System/4.0/screenshots/clean/graph-far.png",
        iconPath: "Dialogue Graph System/brand/icone 1254x1254.png",
        assetStoreUrl: "https://assetstore.unity.com/packages/tools/gui/dialogue-graph-system-332234",
        youtubeUrl: "https://www.youtube.com/watch?v=1K7-WWIBjD0",
        websiteUrl: "https://bekaforge.com/Dialogue%20Graph%20System/index.html",
        supportUrl: "https://bekaforge.com/Dialogue%20Graph%20System/support.html",
        changelogUrl: "https://bekaforge.com/Dialogue%20Graph%20System/changelog.html"
      },
      aiProviders: {
        name: "AI Providers for Unity",
        slug: "ai-providers",
        shortName: "AI Providers",
        status: "Published 1.0.0 · requires unpublished 2.2.0 for DGS 4.0 AI",
        price: "",
        version: "1.0.0",
        description: "AI Providers is the separate provider package. The published listing is version 1.0.0; DGS 4.0 AI features require the unpublished 2.2.0 update. Core dialogue authoring does not require AI Providers.",
        docsPath: "AI Providers/index.html",
        websiteUrl: "https://bekaforge.com/",
        supportUrl: "https://bekaforge.com/AI%20Providers/support.html",
        changelogUrl: "https://bekaforge.com/AI%20Providers/changelog.html",
        screenshotPath: "AI Providers/brand/ai-providers-card-420x280.png",
        iconPath: "AI Providers/brand/ai-providers-icon-1254x1254.png",
        assetStoreUrl: "https://assetstore.unity.com/packages/tools/ai-ml-integration/ai-providers-for-unity-beka-forge-384482",
        youtubeUrl: ""
      },
      aiExtension: {
        name: "Dialogue Graph AI Extension",
        slug: "ai-extension",
        shortName: "AI Extension",
        status: "Included in DGS 4.0.0",
        price: "",
        version: "",
        description: "AI-assisted authoring features included in the DGS 4.0 package; AI Providers is a separate dependency for those features.",
        docsPath: "Dialogue Graph System/guides/ai-generation-workflow.html",
        screenshotPath: "Dialogue Graph AI Extension/brand/ai-extension-card-420x280.png",
        iconPath: "Dialogue Graph AI Extension/brand/ai-extension-icon-160x160.png",
        assetStoreUrl: "",
        youtubeUrl: "",
        websiteUrl: "https://bekaforge.com/Dialogue%20Graph%20System/guides/ai-generation-workflow.html",
        supportUrl: "https://bekaforge.com/Dialogue%20Graph%20System/support.html",
        changelogUrl: "https://bekaforge.com/Dialogue%20Graph%20System/changelog.html"
      }
    }
  };

  const scriptElement = document.currentScript;
  const configUrl = scriptElement && scriptElement.src
    ? new URL("site-config.json", scriptElement.src).href
    : "assets/data/site-config.json";
  const urlKeys = new Set([
    "assetStoreUrl",
    "youtubeUrl",
    "docsPath",
    "websiteUrl",
    "supportUrl",
    "changelogUrl",
    "githubUrl",
    "emailUrl",
    "reportIssueUrl"
  ]);
  const publicProductUrlKeys = new Set(["websiteUrl", "supportUrl", "changelogUrl"]);
  const topicKeys = Object.keys(resources.documentation);
  const strictHttpsKeys = new Set([...publicProductUrlKeys, ...topicKeys]);
  const productKeys = [
    "status",
    "price",
    "version",
    "assetStoreUrl",
    "youtubeUrl",
    "docsPath",
    "websiteUrl",
    "supportUrl",
    "changelogUrl"
  ];

  function isSafeUrl(value, allowEmpty, requireHttps) {
    if (value === "") return allowEmpty;
    if (requireHttps) {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "https:" && Boolean(parsed.hostname);
      } catch {
        return false;
      }
    }
    if (/^(https?:|mailto:)/i.test(value)) return true;
    return !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
  }

  function copyStrings(target, source, keys, optionalEmptyKeys, requireHttpsKeys = strictHttpsKeys) {
    if (!source || Array.isArray(source) || typeof source !== "object") return;

    keys.forEach((key) => {
      if (typeof source[key] !== "string") return;
      const value = source[key].trim();
      const allowEmpty = optionalEmptyKeys.has(key);
      if ((urlKeys.has(key) || requireHttpsKeys.has(key)) && !isSafeUrl(value, allowEmpty, requireHttpsKeys.has(key))) return;
      if (value || allowEmpty) target[key] = value;
    });
  }

  function mergePublicConfig(config) {
    if (!config || Array.isArray(config) || typeof config !== "object") return;

    copyStrings(
      resources.publisher,
      config.publisher,
      ["assetStoreUrl", "youtubeUrl", "githubUrl"],
      new Set()
    );
    copyStrings(
      resources.support,
      config.support,
      ["emailUrl", "reportIssueUrl"],
      new Set()
    );
    copyStrings(resources.documentation, config.documentation, topicKeys, new Set(), strictHttpsKeys);

    Object.keys(resources.products).forEach((productKey) => {
      const productConfig = config.products && config.products[productKey];
      copyStrings(
        resources.products[productKey],
        productConfig,
        productKeys,
        new Set(["assetStoreUrl", "youtubeUrl", "price", "version"])
      );
    });
  }

  function getPath(path) {
    return path.split(".").reduce((value, key) => value && value[key], resources);
  }

  const siteRootUrl = scriptElement && scriptElement.src
    ? new URL("../../", scriptElement.src).href
    : new URL("/", document.baseURI || "https://bekaforge.com/").href;

  function resolveSiteUrl(value) {
    return new URL(value, siteRootUrl).href;
  }

  function bindOptionalHref(element, value) {
    if (typeof value === "string" && value) {
      element.setAttribute("href", resolveSiteUrl(value));
      element.removeAttribute("aria-disabled");
      return;
    }

    element.removeAttribute("href");
    element.setAttribute("aria-disabled", "true");
  }

  function applyTextResources(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-resource-href]").forEach((element) => {
      bindOptionalHref(element, getPath(element.getAttribute("data-resource-href")));
    });

    scope.querySelectorAll("[data-resource-src]").forEach((element) => {
      const value = getPath(element.getAttribute("data-resource-src"));
      if (typeof value === "string" && value) element.setAttribute("src", resolveSiteUrl(value));
    });

    scope.querySelectorAll("[data-resource-text]").forEach((element) => {
      const value = getPath(element.getAttribute("data-resource-text"));
      if (typeof value === "string") element.textContent = value;
    });

    scope.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  const domReady = new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    } else {
      resolve();
    }
  });

  async function loadPublicConfig() {
    await domReady;
    applyTextResources(document);

    try {
      const response = await fetch(configUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Config request failed: ${response.status}`);
      mergePublicConfig(await response.json());
    } catch (error) {
      console.info("Beka Forge public config fallback active.");
    }

    applyTextResources(document);
    return resources;
  }

  window.BekaForgeResources = resources;
  window.applyBekaForgeTextResources = applyTextResources;
  window.BekaForgeConfigReady = loadPublicConfig();
})();
