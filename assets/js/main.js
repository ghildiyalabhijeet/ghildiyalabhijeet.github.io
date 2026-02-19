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
  // Copy helpers (email + project links)
  // ==============================
  const toast = $("#toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.textContent = "";
    }, 1200);
  };

  const copyText = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast(`Copied: ${value}`);
    } catch (_) {
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
  // Skills: filter + inspector + spotlight
  // ==============================
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const skillsCloud = $("#skillsCloud");
  const skillBubbles = $$(".skill-bubble");
  const filters = $$(".filter");

  const skillName = $("#skillName");
  const skillGroup = $("#skillGroup");
  const skillText = $("#skillText");
  const skillsCount = $("#skillsCount");

  const GROUP_LABEL = {
    lang: "Languages",
    data: "Data",
    ml: "ML / DL",
    tools: "Tools",
  };

  skillBubbles.forEach((b, i) => b.style.setProperty("--i", String(i)));

  const setInspector = (bubble) => {
    if (!bubble) return;

    const name = bubble.textContent.trim();
    const group = bubble.dataset.group || "all";
    const desc = bubble.dataset.desc || "—";

    if (skillName) skillName.textContent = name;
    if (skillGroup) skillGroup.textContent = GROUP_LABEL[group] || "All";
    if (skillText) skillText.textContent = desc;

    skillBubbles.forEach((x) => x.classList.toggle("is-selected", x === bubble));
  };

  const updateCount = () => {
    if (!skillsCount) return;
    const visible = skillBubbles.filter((b) => !b.classList.contains("is-dim")).length;
    skillsCount.textContent = `${visible} / ${skillBubbles.length}`;
  };

  const applyFilter = (group) => {
    filters.forEach((f) => f.classList.toggle("is-active", f.dataset.filter === group));

    skillBubbles.forEach((b) => {
      const g = b.dataset.group;
      const dim = !(group === "all" || g === group);
      b.classList.toggle("is-dim", dim);
      b.setAttribute("aria-hidden", dim ? "true" : "false");
    });

    updateCount();

    // auto-select first visible bubble to keep inspector useful
    const firstVisible = skillBubbles.find((b) => !b.classList.contains("is-dim"));
    if (firstVisible) setInspector(firstVisible);
  };

  filters.forEach((f) => f.addEventListener("click", () => applyFilter(f.dataset.filter || "all")));

  skillBubbles.forEach((b) => {
    b.addEventListener("mouseenter", () => setInspector(b));
    b.addEventListener("click", () => setInspector(b));
  });

  // Spotlight cursor
  if (skillsCloud && !prefersReduced) {
    skillsCloud.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        const r = skillsCloud.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        skillsCloud.style.setProperty("--mx", `${x}px`);
        skillsCloud.style.setProperty("--my", `${y}px`);
      },
      { passive: true }
    );
  }

  // default
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
        "Optimization techniques to improve generation speed and efficiency.",
        "Tuned model pipeline/architecture for better throughput.",
        "Team collaboration focused on speed while keeping outputs sharp.",
      ],
      link: "https://github.com/ghildiyalabhijeet/GenAIProject",
    },
    pollution: {
      title: "Particle Pollution (Research Paper)",
      meta: "ML · PM2.5 · Environmental analytics · PDF",
      desc:
        "Research on ML applicability for modeling atmospheric particle pollution using PM2.5 and emissions patterns.",
      bullets: [
        "Analyzed PM2.5 and carbon emission patterns to model environmental impact.",
        "Ran ML models on pollutant datasets in a small research team.",
        "Compiled results into a research paper deliverable.",
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
        "See repository docs for setup and usage.",
      ],
      link: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
    },
    slackbot: {
      title: "Slack Python Q&A Bot",
      meta: "Python · Slack API · Automation",
      desc:
        "A Slack bot that delivers quick, real-time help for Python programming questions via a streamlined interface.",
      bullets: [
        "Integrated Python with Slack API for seamless Q&A interaction.",
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

    t.addEventListener("click", () => selectTile(key));
    t.addEventListener("dblclick", () => openProject(key));

    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openProject(key);
      if (e.key === " ") {
        e.preventDefault();
        selectTile(key);
      }
    });
  });

  if (tiles[0]?.dataset.project) selectTile(tiles[0].dataset.project);

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
    return Math.max(280, Math.round(row.clientWidth * 0.62));
  };

  prevBtn?.addEventListener("click", () => row?.scrollBy({ left: -scrollByAmount(), behavior: "smooth" }));
  nextBtn?.addEventListener("click", () => row?.scrollBy({ left: scrollByAmount(), behavior: "smooth" }));
})();
