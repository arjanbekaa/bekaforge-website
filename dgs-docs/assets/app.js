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
        { id: "import-export", label: "JSON Import and Export", href: "modules/import-export.html", search: "json import export legacy bridge tooling dto importer exporter manual" },
        { id: "settings-system", label: "Settings System", href: "modules/settings-system.html", search: "settings runtime master text choice input audio" },
        { id: "history-and-transcripts", label: "History and Transcripts", href: "modules/history-and-transcripts.html", search: "history backlog transcript branch reconstruction" },
        { id: "ai-extension", label: "AI Extension", href: "modules/ai-extension.html", search: "ai extension prompt preview draft llm provider authoring sidebar" }
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
        { id: "integrating-actions", label: "Integrating Actions", href: "guides/integrating-actions.html", search: "guide actions integration runner handlers action nodes" },
        { id: "ai-generation-workflow", label: "AI Authoring Workflow", href: "guides/ai-generation-workflow.html", search: "guide ai authoring workflow preview provider sidebar draft" }
      ]
    },
    {
      title: "Operations",
      items: [
        { id: "troubleshooting", label: "Troubleshooting", href: "troubleshooting.html", search: "troubleshooting issues problems setup broken choices transcript json ai" },
        { id: "faq", label: "FAQ", href: "faq.html", search: "faq questions answers runtime editor ui ai" },
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

    const headings = Array.from(article.querySelectorAll("h2, h3"));
    if (!headings.length) {
      host.innerHTML = "";
      return;
    }

    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent || "");
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
    // Insert before the back-to-site link so it sits between search and ← BekaForge
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
  setupMenu();
  setYear();
  fadeInPanels();
  renderRoadmapButton();
})();
