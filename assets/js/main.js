(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Years
  const y = String(new Date().getFullYear());
  const year1 = $("#year");
  const year2 = $("#year2");
  if (year1) year1.textContent = y;
  if (year2) year2.textContent = y;

  // ==============================
  // Nav active state (scroll spy)
  // ==============================
  const navLinks = $$(".nav-item");
  const sections = navLinks
    .map((a) => ({
      a,
      id: (a.getAttribute("href") || "").replace("#", ""),
    }))
    .map((o) => ({ ...o, el: document.getElementById(o.id) }))
    .filter((o) => o.el);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", href === `#${id}`);
    });
  };

  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target.id);
      },
      { threshold: [0.25, 0.4, 0.55, 0.7] }
    );

    sections.forEach((s) => io.observe(s.el));

    const initial = (location.hash || "").replace("#", "");
    if (initial && sections.some((s) => s.id === initial)) setActive(initial);
    else setActive(sections[0].id);
  }

  // ==============================
  // Copy helpers (About)
  // ==============================
  const toast = $("#toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.textContent = "";
    }, 1200);
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`Copied: ${value}`);
    } catch (_) {
      // fallback
      const temp = document.createElement("input");
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand("copy");
        showToast(`Copied: ${value}`);
      } finally {
        document.body.removeChild(temp);
      }
    }
  };

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.getAttribute("data-copy") || ""));
  });

  // ==============================
  // Skills: filter + inspector
  // ==============================
  const skillText = $("#skillText");
  const skillBubbles = $$(".skill-bubble");
  const filters = $$(".filter");

  const setSkillInspector = (text) => {
    if (!skillText) return;
    skillText.textContent = text;
  };

  skillBubbles.forEach((b) => {
    b.addEventListener("mouseenter", () => {
      const desc = b.getAttribute("data-desc") || "—";
      setSkillInspector(desc);
    });
    b.addEventListener("click", () => {
      const desc = b.getAttribute("data-desc") || "—";
      setSkillInspector(desc);
    });
  });

  const applyFilter = (group) => {
    filters.forEach((f) => f.classList.toggle("is-active", f.dataset.filter === group));
    skillBubbles.forEach((b) => {
      const g = b.getAttribute("data-group");
      const dim = !(group === "all" || g === group);
      b.classList.toggle("is-dim", dim);
      b.setAttribute("aria-hidden", dim ? "true" : "false");
    });
  };

  filters.forEach((f) => {
    f.addEventListener("click", () => applyFilter(f.dataset.filter || "all"));
  });

  // default filter
  applyFilter("all");

  // ==============================
  // Projects Drawer (select + dblclick open)
  // ==============================
  const PROJECTS = {
    genai: {
      title: "Faster Diffusion",
      meta: "GenAI · Diffusion · Optimization · Python",
      desc:
        "Performance-focused diffusion work aimed at improving image generation efficiency while maintaining quality.",
      bullets: [
        "Implemented optimization techniques to increase generation speed and efficiency.",
        "Tuned model pipeline/architecture for better throughput.",
        "Collaborated in a team setting to improve runtime while keeping results sharp.",
      ],
      link: "https://github.com/ghildiyalabhijeet/GenAIProject",
    },
    pollution: {
      title: "Particle Pollution (Research Paper)",
      meta: "ML · PM2.5 · Environmental analytics · PDF",
      desc:
        "Research on ML applicability for modeling atmospheric particle pollution using PM2.5 and carbon emissions patterns.",
      bullets: [
        "Analyzed PM2.5 and carbon emission patterns to model environmental impact.",
        "Ran ML models on pollutant datasets in a small research team.",
        "Compiled results into a formal research paper deliverable.",
      ],
      link:
        "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
    },
    pipeline: {
      title: "Digital Assets Analytics Pipeline",
      meta: "Analytics · Data pipeline · Repo",
      desc:
        "An analytics pipeline repository for digital asset data — open the repo for the full README, code, and architecture details.",
      bullets: [
        "End-to-end pipeline structure for ingest → transform → analyze.",
        "Designed for reproducible analytics workflows.",
        "See repository documentation for setup and usage.",
      ],
      link: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
    },
    slackbot: {
      title: "Slack Python Q&A Bot",
      meta: "Python · Slack API · Automation",
      desc:
        "A Slack bot that delivers quick, real-time help for Python programming questions via a streamlined interface.",
      bullets: [
        "Integrated Python with the Slack API for a smooth Q&A workflow.",
        "Built for fast troubleshooting and reduced context-switching.",
        "Optimized for real-time interaction and rapid response loops.",
      ],
      link: "https://github.com/AII-projects/slackbot",
    },
  };

  const row = $("#projectsRow");
  const tiles = row ? $$(".proj-square", row) : [];
  const titleEl = $("#projTitle");
  const metaEl = $("#projMeta");
  const descEl = $("#projDesc");
  const bulletsEl = $("#projBullets");
  const openEl = $("#projOpen");
  const copyBtn = $("#projCopy");

  const selectTile = (key) => {
    const p = PROJECTS[key];
    if (!p) return;

    tiles.forEach((t) => t.classList.toggle("is-selected", t.dataset.project === key));

    if (titleEl) titleEl.textContent = p.title;
    if (metaEl) metaEl.textContent = p.meta;
    if (descEl) descEl.textContent = p.desc;

    if (bulletsEl) {
      bulletsEl.innerHTML = "";
      p.bullets.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b;
        bulletsEl.appendChild(li);
      });
    }

    if (openEl) openEl.href = p.link;
    if (copyBtn) copyBtn.dataset.copy = p.link;
  };

  const openProject = (key) => {
    const p = PROJECTS[key];
    if (!p) return;
    window.open(p.link, "_blank", "noopener,noreferrer");
  };

  tiles.forEach((t) => {
    const key = t.dataset.project;

    // single click selects (preview)
    t.addEventListener("click", () => selectTile(key));

    // double click opens (your requirement)
    t.addEventListener("dblclick", () => openProject(key));

    // keyboard: Enter opens, Space selects
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openProject(key);
      if (e.key === " ") {
        e.preventDefault();
        selectTile(key);
      }
    });
  });

  // Default select first tile
  if (tiles[0]?.dataset.project) selectTile(tiles[0].dataset.project);

  // Copy link button (Projects)
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.copy || (openEl ? openEl.href : "");
      if (url) copyText(url);
    });
  }

  // Drawer scroll buttons
  const prevBtn = $("#projectsPrev");
  const nextBtn = $("#projectsNext");

  const scrollByAmount = () => {
    if (!row) return 0;
    // approx 1 tile + gap
    return Math.max(240, Math.round(row.clientWidth * 0.62));
  };

  prevBtn?.addEventListener("click", () => {
    if (!row) return;
    row.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    if (!row) return;
    row.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
  });
})();
