(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Years
  const y = String(new Date().getFullYear());
  $("#year") && ($("#year").textContent = y);
  $("#year2") && ($("#year2").textContent = y);

  // ==============================
  // Neon snowflake roam (NOT STATIC)
  // ==============================
  const snowflake = $("#snowflakeModel");
  if (snowflake && !prefersReduced) {
    // Disable CSS fallback animation once JS is active (prevents double motion)
    snowflake.style.animation = "none";

    let t0 = performance.now();

    const tick = (t) => {
      const time = (t - t0) / 1000;

      const size = snowflake.offsetWidth || 180;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // smooth roam (lissajous-like)
      const nx = 0.5 + 0.34 * Math.sin(time / 9.2) + 0.10 * Math.sin(time / 3.4);
      const ny = 0.5 + 0.30 * Math.cos(time / 10.4) + 0.10 * Math.sin(time / 4.0);

      const x = (w - size) * nx;
      const y = (h - size) * ny;

      const rot = time * 18;                // slow spin
      const scale = 0.94 + 0.06 * Math.sin(time / 4.8);

      snowflake.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // ==============================
  // Nav active state (scroll spy)
  // ==============================
  const navLinks = $$(".nav-item");
  const sections = navLinks
    .map((a) => ({ a, id: (a.getAttribute("href") || "").replace("#", "") }))
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
    setActive(sections[0].id);
  }

  // ==============================
  // Copy helpers (email + project links)
  // ==============================
  const toast = $("#toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.textContent = ""), 1200);
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

  $$("[data-copy]").forEach((btn) => btn.addEventListener("click", () => copyText(btn.dataset.copy || "")));

  // ==============================
  // Skills: filter + inspector + spotlight
  // ==============================
  const skillsCloud = $("#skillsCloud");
  const skillBubbles = $$(".skill-bubble");
  const filters = $$(".filter");

  const skillName = $("#skillName");
  const skillGroup = $("#skillGroup");
  const skillText = $("#skillText");
  const skillsCount = $("#skillsCount");

  const GROUP_LABEL = { lang: "Languages", data: "Data", ml: "ML / DL", tools: "Tools" };
  skillBubbles.forEach((b, i) => b.style.setProperty("--i", String(i)));

  const setInspector = (bubble) => {
    if (!bubble) return;
    const name = bubble.textContent.trim();
    const group = bubble.dataset.group || "all";
    const desc = bubble.dataset.desc || "—";

    skillName && (skillName.textContent = name);
    skillGroup && (skillGroup.textContent = GROUP_LABEL[group] || "All");
    skillText && (skillText.textContent = desc);

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
      const dim = !(group === "all" || b.dataset.group === group);
      b.classList.toggle("is-dim", dim);
      b.setAttribute("aria-hidden", dim ? "true" : "false");
    });

    updateCount();
    const firstVisible = skillBubbles.find((b) => !b.classList.contains("is-dim"));
    if (firstVisible) setInspector(firstVisible);
  };

  filters.forEach((f) => f.addEventListener("click", () => applyFilter(f.dataset.filter || "all")));
  skillBubbles.forEach((b) => {
    b.addEventListener("mouseenter", () => setInspector(b));
    b.addEventListener("click", () => setInspector(b));
  });

  if (skillsCloud && !prefersReduced) {
    skillsCloud.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        const r = skillsCloud.getBoundingClientRect();
        skillsCloud.style.setProperty("--mx", `${e.clientX - r.left}px`);
        skillsCloud.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  applyFilter("all");

  // ==============================
  // Projects: infinite scroll + auto switch every 4s + drawer in/out
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
        "Compiled findings into a research paper deliverable.",
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
  const drawer = $("#projectsDrawer");
  const titleEl = $("#projTitle");
  const metaEl = $("#projMeta");
  const descEl = $("#projDesc");
  const bulletsEl = $("#projBullets");
  const openEl = $("#projOpen");
  const copyBtn = $("#projCopy");

  const prevBtn = $("#projectsPrev");
  const nextBtn = $("#projectsNext");

  let originals = [];
  let setWidth = 0;
  let currentTile = null;
  let autoTimer = null;

  const tilesAll = () => (row ? Array.from(row.querySelectorAll(".proj-square")) : []);

  const centerTile = (tile, smooth = true) => {
    if (!row || !tile) return;
    const left = tile.offsetLeft - (row.clientWidth - tile.offsetWidth) / 2;
    row.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  };

  const updateDetails = (key) => {
    const p = PROJECTS[key];
    if (!p) return;

    titleEl && (titleEl.textContent = p.title);
    metaEl && (metaEl.textContent = p.meta);
    descEl && (descEl.textContent = p.desc);

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

  const selectTileElement = (tile, { center = false, smooth = true } = {}) => {
    if (!tile) return;
    const key = tile.dataset.project;
    if (!PROJECTS[key]) return;

    tilesAll().forEach((t) => t.classList.remove("is-selected"));
    tile.classList.add("is-selected");

    currentTile = tile;
    updateDetails(key);

    if (center) centerTile(tile, smooth);
  };

  const nearestCenterTile = () => {
    if (!row) return null;
    const tiles = tilesAll();
    if (!tiles.length) return null;

    const center = row.scrollLeft + row.clientWidth / 2;
    let best = tiles[0];
    let bestDist = Infinity;

    for (const t of tiles) {
      const tc = t.offsetLeft + t.offsetWidth / 2;
      const d = Math.abs(tc - center);
      if (d < bestDist) {
        best = t;
        bestDist = d;
      }
    }
    return best;
  };

  const wrapInfinite = () => {
    if (!row || !setWidth || !originals.length) return;
    const firstOrig = originals[0];
    const leftLimit = firstOrig.offsetLeft - setWidth * 0.5;
    const rightLimit = firstOrig.offsetLeft + setWidth * 1.5;

    if (row.scrollLeft < leftLimit) row.scrollLeft += setWidth;
    else if (row.scrollLeft > rightLimit) row.scrollLeft -= setWidth;
  };

  const setupInfinite = () => {
    if (!row) return;

    // capture originals BEFORE cloning
    originals = Array.from(row.querySelectorAll(".proj-square"));
    if (originals.length < 2) return;

    // clone before
    const beforeFrag = document.createDocumentFragment();
    originals.forEach((t) => beforeFrag.appendChild(t.cloneNode(true)));
    row.insertBefore(beforeFrag, row.firstChild);

    // clone after
    const afterFrag = document.createDocumentFragment();
    originals.forEach((t) => afterFrag.appendChild(t.cloneNode(true)));
    row.appendChild(afterFrag);

    // measure after layout
    requestAnimationFrame(() => {
      const firstOrig = originals[0];
      const lastOrig = originals[originals.length - 1];
      setWidth = (lastOrig.offsetLeft + lastOrig.offsetWidth) - firstOrig.offsetLeft;

      selectTileElement(firstOrig, { center: true, smooth: false });
    });

    let scrollEndT = 0;
    row.addEventListener(
      "scroll",
      () => {
        wrapInfinite();
        clearTimeout(scrollEndT);
        scrollEndT = window.setTimeout(() => {
          const t = nearestCenterTile();
          if (t) selectTileElement(t);
        }, 120);
      },
      { passive: true }
    );
  };

  const getNextTile = (dir = 1) => {
    const tiles = tilesAll();
    if (!tiles.length) return null;

    if (!currentTile) currentTile = tiles.find((t) => t.classList.contains("is-selected")) || tiles[0];

    const idx = tiles.indexOf(currentTile);
    if (idx === -1) return tiles[0];

    const next = tiles[idx + dir];
    return next || (dir > 0 ? tiles[0] : tiles[tiles.length - 1]);
  };

  const stopAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
    drawer && drawer.classList.remove("is-cycle-out");
  };

  const cycleOnce = () => {
    if (!row) return;
    const next = getNextTile(1);
    if (!next) return;

    // drawer out
    if (drawer) drawer.classList.add("is-cycle-out");

    // switch content while hidden
    window.setTimeout(() => {
      selectTileElement(next, { center: true, smooth: true });
    }, 260);

    // drawer back in
    window.setTimeout(() => {
      if (drawer) drawer.classList.remove("is-cycle-out");
    }, 520);
  };

  const startAuto = () => {
    if (prefersReduced || !row) return;
    stopAuto();
    autoTimer = window.setInterval(cycleOnce, 4000);
  };

  // Event delegation (works for clones too)
  if (row) {
    row.addEventListener("click", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      stopAuto();
      selectTileElement(tile, { center: true, smooth: true });
      startAuto();
    });

    row.addEventListener("dblclick", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      const key = tile.dataset.project;
      const p = PROJECTS[key];
      if (p) window.open(p.link, "_blank", "noopener,noreferrer");
    });

    row.addEventListener("keydown", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      if (e.key === "Enter") {
        const key = tile.dataset.project;
        const p = PROJECTS[key];
        if (p) window.open(p.link, "_blank", "noopener,noreferrer");
      }
    });
  }

  // Copy link button
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.copy || (openEl ? openEl.href : "");
      if (url) copyText(url);
    });
  }

  // Prev/Next buttons
  prevBtn?.addEventListener("click", () => {
    stopAuto();
    const prev = getNextTile(-1);
    if (prev) selectTileElement(prev, { center: true, smooth: true });
    startAuto();
  });

  nextBtn?.addEventListener("click", () => {
    stopAuto();
    const next = getNextTile(1);
    if (next) selectTileElement(next, { center: true, smooth: true });
    startAuto();
  });

  // Pause auto when user is hovering/working in the drawer
  drawer?.addEventListener("pointerenter", stopAuto);
  drawer?.addEventListener("pointerleave", startAuto);
  drawer?.addEventListener("focusin", stopAuto);
  drawer?.addEventListener("focusout", startAuto);

  // Init
  setupInfinite();
  startAuto();
})();
