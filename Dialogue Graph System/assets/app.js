(function () {
  "use strict";

  const NAV = [
    {
      title: "Overview",
      items: [
        { id: "home", label: "Home", href: "index.html", search: "overview docs homepage portal features audience quickstart" },
        { id: "getting-started", label: "Getting Started", href: "getting-started.html", search: "getting started demo first read onboarding" },
        { id: "installation", label: "Installation", href: "installation.html", search: "installation setup unity packages manager scene ui panel" },
        { id: "architecture", label: "Architecture", href: "architecture.html", search: "architecture runtime editor ai extension diagrams data flow control flow" },
        { id: "core-concepts", label: "Core Concepts", href: "core-concepts.html", search: "core concepts dialog graph node types ids transcript history" },
        { id: "quick-tutorial", label: "Quick Tutorial", href: "quick-tutorial.html", search: "quick tutorial create graph runtime branching" }
      ]
    },
    {
      title: "Modules",
      items: [
        { id: "runtime-dialog-flow", label: "Runtime Dialog Flow", href: "modules/runtime-dialog-flow.html", search: "dialog manager runtime traversal autoplay skip actions branch path" },
        { id: "graph-editor", label: "Graph Editor", href: "modules/graph-editor.html", search: "graph editor graphview node views launcher save load undo" },
        { id: "node-reference", label: "Node Reference · Live", href: "node-reference.html", search: "nodes start end dialogue dialog choice action condition set variable mutation graph jump outcome random branch switch wait wait for camera follow point target move look at shake restore" },
        { id: "inspector-reference", label: "Inspector Reference · Live", href: "inspector-reference.html", search: "inspector dialog manager graph registry node variable store character text choices audio input voice delivery environment context localization welcome runtime ui categories camera rig target interactable interactor" },
        { id: "import-export", label: "JSON Import and Export", href: "modules/import-export.html", search: "json import export legacy bridge tooling dto importer exporter manual" },
        { id: "settings-system", label: "Settings System", href: "modules/settings-system.html", search: "settings runtime master text choice input audio" },
        { id: "history-and-transcripts", label: "History and Transcripts", href: "modules/history-and-transcripts.html", search: "history backlog transcript branch reconstruction" }
      ]
    },
    {
      title: "API and UI",
      items: [
        { id: "dialog-manager", label: "DialogManager API", href: "api/dialog-manager.html", search: "api dialogmanager playback transcript branch path public methods" },
        { id: "dialog-action-runner", label: "DialogActionRunner API", href: "api/dialog-action-runner.html", search: "api action runner handlers bindings unityevent" },
        { id: "runtime-ui", label: "Runtime UI Components", href: "components/runtime-ui.html", search: "ui dialoguicontroller choicebuttonview historyview components" }
      ]
    },
    {
      title: "Guides",
      items: [
        { id: "creating-a-dialog", label: "Creating a Dialog", href: "guides/creating-a-dialog.html", search: "guide creating dialog authoring graph mapping dialogid" },
        { id: "banter-setup", label: "Set Up Banter", href: "guides/banter-setup.html", search: "banter ambient npc chatter exchange catalog speakers cooldown setup getting started" },
        { id: "walla-setup", label: "Set Up Walla and Sound", href: "guides/walla-setup.html", search: "walla sound sequencer ambience layers timeline clips binding audio setup" },
        { id: "integrating-actions", label: "Integrating Actions", href: "guides/integrating-actions.html", search: "guide actions integration runner handlers action nodes" },
        { id: "camera-interaction-ui", label: "Camera, Interaction & UI", href: "guides/camera-interaction-ui.html", search: "camera controller interaction interactable interactor runtime ui themes setup step by step" },
        { id: "ai-generation-workflow", label: "AI Authoring", href: "guides/ai-generation-workflow.html", search: "ai authoring extension provider setup review generated changes" },
        { id: "screenshots", label: "4.0 Screenshots", href: "4.0/screenshots/index.html", search: "screenshots images editor setup banter walla providers gallery" },
        { id: "interactive-preview", label: "Interactive Preview", href: "preview/index.html", search: "interactive preview editor windows graph nodes settings example rebuild" }
      ]
    },
    {
      title: "Operations",
      items: [
        { id: "troubleshooting", label: "Troubleshooting", href: "troubleshooting.html", search: "troubleshooting issues problems setup broken choices transcript json ai" },
        { id: "faq", label: "FAQ", href: "faq.html", search: "faq questions answers runtime editor ui ai" },
        { id: "changelog", label: "Changelog", href: "changelog.html", search: "changelog release version 4.0 package publication status" },
        { id: "license", label: "License", href: "license.html", search: "license unity asset store eula terms" },
        { id: "support", label: "Support", href: "support.html", search: "support report issue email help" },
        { id: "maintainer-notes", label: "Maintainer Notes", href: "maintainer-notes.html", search: "maintainer notes contributors fragile areas conventions refactor" }
      ]
    }
  ];

  const flatItems = NAV.flatMap((group) => group.items);
  const body = document.body;
  const base = body.dataset.base || "";
  const currentPage = body.dataset.page || "home";

  function withBase(href) {
    return base + href;
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSidebar() {
    const host = document.querySelector("[data-sidebar-nav]");
    if (!host) return;

    host.innerHTML = `
      <label class="sidebar-label" for="doc-filter">Filter pages</label>
      <div class="search-wrap">
        <input id="doc-filter" class="search-input" type="search" placeholder="Search docs pages" autocomplete="off" />
      </div>
      <div id="nav-groups"></div>
    `;

    const navGroups = host.querySelector("#nav-groups");
    const input = host.querySelector("#doc-filter");

    function draw(query) {
      const q = (query || "").trim().toLowerCase();
      let visibleCount = 0;
      navGroups.innerHTML = NAV.map((group) => {
        const items = group.items.filter((item) => {
          if (!q) return true;
          return `${item.label} ${item.search}`.toLowerCase().includes(q);
        });
        visibleCount += items.length;
        if (!items.length) return "";
        return `
          <section class="nav-group">
            <h2 class="nav-group-title">${escapeHtml(group.title)}</h2>
            <ul class="nav-list">
              ${items.map((item) => `
                <li>
                  <a class="nav-link ${item.id === currentPage ? "active" : ""}" href="${withBase(item.href)}">
                    ${escapeHtml(item.label)}
                  </a>
                </li>
              `).join("")}
            </ul>
          </section>
        `;
      }).join("");

      if (!visibleCount) {
        navGroups.innerHTML = `<p class="search-empty">No pages match that search.</p>`;
      }
    }

    input.addEventListener("input", () => draw(input.value));
    draw("");
  }

  function renderPrevNext() {
    const host = document.querySelector("[data-prev-next]");
    if (!host) return;

    const index = flatItems.findIndex((item) => item.id === currentPage);
    if (index === -1) {
      host.innerHTML = "";
      return;
    }

    const prev = flatItems[index - 1] || null;
    const next = flatItems[index + 1] || null;

    host.innerHTML = `
      ${prev ? `
        <a href="${withBase(prev.href)}">
          <small>Previous</small>
          <strong>${escapeHtml(prev.label)}</strong>
        </a>
      ` : `<div></div>`}
      ${next ? `
        <a href="${withBase(next.href)}">
          <small>Next</small>
          <strong>${escapeHtml(next.label)}</strong>
        </a>
      ` : `<div></div>`}
    `;
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function renderToc() {
    const host = document.querySelector("[data-page-toc]");
    const article = document.querySelector("[data-doc-content]");
    if (!host || !article) return;

    const headings = Array.from(article.querySelectorAll("h2, h3")).filter((heading) => {
      const entry = heading.closest(".reference-entry");
      return !entry || heading === entry.querySelector("h2, h3");
    });
    if (!headings.length) {
      host.innerHTML = "";
      return;
    }

    headings.forEach((heading) => {
      if (!heading.id) {
        const base = slugify(heading.textContent || "") || "section";
        let id = base;
        let suffix = 2;
        while (document.getElementById(id)) id = `${base}-${suffix++}`;
        heading.id = id;
      }
    });

    host.innerHTML = `
      <div class="toc-card">
        <p class="toc-title">On this page</p>
        <ul class="toc-list">
          ${headings.map((heading) => `
            <li>
              <a class="toc-link" data-toc-link href="#${heading.id}">
                ${escapeHtml(heading.textContent || "")}
              </a>
            </li>
          `).join("")}
        </ul>
      </div>
    `;

    const links = Array.from(host.querySelectorAll("[data-toc-link]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 1]
    });

    headings.forEach((heading) => observer.observe(heading));
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll("pre").forEach((block) => {
      const code = block.querySelector("code");
      if (!code) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "Copy";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          button.textContent = "Copied";
          button.classList.add("copied");
          window.setTimeout(() => {
            button.textContent = "Copy";
            button.classList.remove("copied");
          }, 1400);
        } catch (_error) {
          button.textContent = "Failed";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1400);
        }
      });
      block.appendChild(button);
    });
  }
  function setupImagePreview() {
    const images = Array.from(document.querySelectorAll("img.screenshot-img"));
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("hidden", "hidden");
    overlay.innerHTML = `
      <div class="image-lightbox__backdrop" data-lightbox-close></div>
      <div class="image-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image preview">
        <button class="image-lightbox__close" type="button" aria-label="Close image preview" data-lightbox-close>Close</button>
        <img class="image-lightbox__image" alt="" />
        <p class="image-lightbox__caption"></p>
      </div>
    `;

    const previewImage = overlay.querySelector(".image-lightbox__image");
    const previewCaption = overlay.querySelector(".image-lightbox__caption");
    let lastTrigger = null;

    function closeLightbox() {
      overlay.setAttribute("hidden", "hidden");
      document.body.classList.remove("lightbox-open");
      previewImage.removeAttribute("src");
      previewImage.alt = "";
      previewCaption.textContent = "";
      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    }

    function openLightbox(image) {
      lastTrigger = image;
      previewImage.src = image.currentSrc || image.src;
      previewImage.alt = image.alt || "Documentation screenshot preview";
      previewCaption.textContent = image.alt || image.getAttribute("data-preview-caption") || "Documentation screenshot";
      overlay.removeAttribute("hidden");
      document.body.classList.add("lightbox-open");
      overlay.querySelector(".image-lightbox__close").focus();
    }

    overlay.addEventListener("click", (event) => {
      if (event.target.closest("[data-lightbox-close]")) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (overlay.hasAttribute("hidden")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "Tab") {
        event.preventDefault();
        overlay.querySelector(".image-lightbox__close").focus();
      }
    });

    images.forEach((image) => {
      image.classList.add("is-previewable");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${image.alt || "Documentation screenshot"}. Open preview`);
      image.addEventListener("click", () => openLightbox(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    document.body.appendChild(overlay);
  }

  function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", body.classList.contains("nav-open") ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) return;
      const sidebar = document.querySelector(".sidebar");
      if (!sidebar) return;
      if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !body.classList.contains("nav-open")) return;
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
  }

  function setYear() {
    document.querySelectorAll("[data-current-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function fadeInPanels() {
    document.querySelectorAll(".page-hero, .doc-article, .panel, .doc-card, .placeholder-card").forEach((el, index) => {
      el.classList.add("fade-in");
      el.style.animationDelay = `${Math.min(index * 35, 220)}ms`;
    });
  }

  function renderRoadmapButton() {
    const actions = document.querySelector(".top-actions");
    if (!actions) return;
    const btn = document.createElement("a");
    btn.href = withBase("../roadmap.html");
    btn.className = "roadmap-header-btn";
    btn.textContent = "Roadmap";
    // Insert before the back-to-site link so it sits between search and navigation.
    const backLink = actions.querySelector(".back-to-site");
    if (backLink) {
      actions.insertBefore(btn, backLink);
    } else {
      actions.appendChild(btn);
    }
  }

  renderSidebar();
  renderPrevNext();
  renderToc();
  enhanceCodeBlocks();
  setupImagePreview();
  setupMenu();
  setYear();
  fadeInPanels();
  renderRoadmapButton();
  document.querySelector('.topbar input[readonly]')?.closest('.search-wrap')?.remove();
  import(new URL("../../assets/documentation/live-previews.js", document.currentScript.src).href)
    .then(({ enhanceLivePreviews }) => enhanceLivePreviews())
    .catch((error) => console.warn("Live examples are unavailable; use the standalone preview links.", error));
})();
