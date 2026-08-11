(function () {
  "use strict";

  const NAV = [
    {
      title: "Overview",
      items: [
        { id: "home", label: "Home", href: "index.html", search: "overview ai providers connector docs provider assets transport unity" },
        { id: "getting-started", label: "Getting Started", href: "getting-started.html", search: "getting started setup provider asset api key editor window quick start" },
        { id: "architecture", label: "Architecture", href: "architecture.html", search: "architecture service provider abstraction request response transport" }
      ]
    },
    {
      title: "Modules",
      items: [
        { id: "provider-assets", label: "Provider Assets", href: "modules/provider-assets.html", search: "providers openai deepseek gemini ollama custom json asset types" },
        { id: "request-pipeline", label: "Request Pipeline", href: "modules/request-pipeline.html", search: "trysendprompt sendpromptcoroutine request pipeline timeout retry unitywebrequest" },
        { id: "settings-and-keys", label: "Settings and Keys", href: "modules/settings-and-keys.html", search: "settings keys playerprefs local secret provider guid editorprefs" }
      ]
    },
    {
      title: "API and Ops",
      items: [
        { id: "public-api", label: "Public API", href: "api/public-api.html", search: "public api aiprovidersservice llmproviderdefinitionbase llmchatrequest promptresult" },
        { id: "troubleshooting", label: "Troubleshooting", href: "troubleshooting.html", search: "troubleshooting security notes blocking request runtime retry ollama errors" }
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
      ${prev ? `<a href="${withBase(prev.href)}"><small>Previous</small><strong>${escapeHtml(prev.label)}</strong></a>` : `<div></div>`}
      ${next ? `<a href="${withBase(next.href)}"><small>Next</small><strong>${escapeHtml(next.label)}</strong></a>` : `<div></div>`}
    `;
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
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
      if (!heading.id) heading.id = slugify(heading.textContent || "");
    });
    host.innerHTML = `
      <div class="toc-card">
        <p class="toc-title">On this page</p>
        <ul class="toc-list">
          ${headings.map((heading) => `<li><a class="toc-link" data-toc-link href="#${heading.id}">${escapeHtml(heading.textContent || "")}</a></li>`).join("")}
        </ul>
      </div>
    `;
    const links = Array.from(host.querySelectorAll("[data-toc-link]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] });
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
      if (event.key === "Escape" && !overlay.hasAttribute("hidden")) {
        closeLightbox();
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
    btn.href = withBase("../roadmap.html#ai-providers");
    btn.className = "roadmap-header-btn";
    btn.textContent = "Roadmap";
    const backLink = actions.querySelector(".back-to-site");
    if (backLink) actions.insertBefore(btn, backLink);
    else actions.appendChild(btn);
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
})();
