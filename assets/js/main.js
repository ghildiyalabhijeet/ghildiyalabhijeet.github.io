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
  // Snowflake roam (FIXED: not static)
  // - JS drives movement (CSS fallback stays if JS fails)
  // ==============================
  const snowflake = $("#snowflakeModel");
  if (snowflake) {
    // Disable fallback animation when JS is active
    snowflake.style.animation = "none";

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    let t0 = performance.now();
    let mouseX = 0.5;
    let mouseY = 0.5;

    // subtle mouse influence (makes it feel alive)
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        mouseX = e.clientX / Math.max(1, window.innerWidth);
        mouseY = e.clientY / Math.max(1, window.innerHeight);
      },
      { passive: true }
    );

    let fx = 0.5;
    let fy = 0.5;

    const tick = (t) => {
      const time = (t - t0) / 1000;

      const size = snowflake.offsetWidth || 160;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // roam path (more obvious movement)
      const nx = 0.5 + 0.36 * Math.sin(time / 7.8) + 0.12 * Math.sin(time / 2.9);
      const ny = 0.5 + 0.32 * Math.cos(time / 9.2) + 0.12 * Math.sin(time / 3.6);

      // blend with mouse a bit
      const tx = clamp01(lerp(nx, mouseX, 0.12));
      const ty = clamp01(lerp(ny, mouseY, 0.10));

      // smooth-follow (prevents jitter)
      fx = lerp(fx, tx, 0.035);
      fy = lerp(fy, ty, 0.032);

      const x = (w - size) * fx;
      const y = (h - size) * fy;

      const rot = time * 22; // spin
      const scale = 0.92 + 0.07 * Math.sin(time / 4.4);

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
      a.classList.toggle("is-active", (a.getAttribute("href") || "") === `#${id}`);
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
  // Copy helpers
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

  if (skillsCloud) {
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
  // Projects: 2-up view + infinite loop + auto switch
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

  const snapTileToStart = (tile, smooth = true) => {
    if (!row || !tile) return;
    row.scrollTo({ left: tile.offsetLeft, behavior: smooth ? "smooth" : "auto" });
  };

  const updateDetails = (key) => {
    const p = PROJECTS[key];
    if (!p) return;

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

  const selectTileElement = (tile, { snap = false, smooth = true } = {}) => {
    if (!tile) return;
    const key = tile.dataset.project;
    if (!PROJECTS[key]) return;

    tilesAll().forEach((t) => t.classList.remove("is-selected"));
    tile.classList.add("is-selected");

    currentTile = tile;
    updateDetails(key);

    if (snap) snapTileToStart(tile, smooth);
  };

  const nearestStartTile = () => {
    if (!row) return null;
    const tiles = tilesAll();
    if (!tiles.length) return null;

    const left = row.scrollLeft;
    let best = tiles[0];
    let bestDist = Infinity;

    for (const t of tiles) {
      const d = Math.abs(t.offsetLeft - left);
      if (d < bestDist) {
        best = t;
        bestDist = d;
      }
    }
    return best;
  };

  const measureSetWidth = () => {
    if (!row || !originals.length) return;
    const firstOrig = originals[0];
    const lastOrig = originals[originals.length - 1];
    setWidth = (lastOrig.offsetLeft + lastOrig.offsetWidth) - firstOrig.offsetLeft;
  };

  const wrapInfinite = () => {
    if (!row || !setWidth || !originals.length) return;

    const firstOrig = originals[0];
    const start = firstOrig.offsetLeft; // typically ≈ setWidth

    // keep scroll in the middle band
    if (row.scrollLeft < start - setWidth * 0.25) row.scrollLeft += setWidth;
    else if (row.scrollLeft > start + setWidth * 1.25) row.scrollLeft -= setWidth;
  };

  const setupInfinite = () => {
    if (!row) return;

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

    requestAnimationFrame(() => {
      measureSetWidth();

      // start at the original set (middle)
      selectTileElement(originals[0], { snap: true, smooth: false });
    });

    let scrollEndT = 0;
    row.addEventListener(
      "scroll",
      () => {
        wrapInfinite();

        clearTimeout(scrollEndT);
        scrollEndT = window.setTimeout(() => {
          const t = nearestStartTile();
          if (t) selectTileElement(t);
        }, 120);
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        requestAnimationFrame(() => {
          measureSetWidth();
          // keep the current tile snapped correctly after resize
          if (currentTile) snapTileToStart(currentTile, false);
        });
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

    return tiles[idx + dir] || (dir > 0 ? tiles[0] : tiles[tiles.length - 1]);
  };

  const stopAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
    if (drawer) drawer.classList.remove("is-cycle-out");
  };

  const cycleOnce = () => {
    if (!row) return;
    const next = getNextTile(1);
    if (!next) return;

    if (drawer) drawer.classList.add("is-cycle-out");

    window.setTimeout(() => {
      selectTileElement(next, { snap: true, smooth: true });
    }, 260);

    window.setTimeout(() => {
      if (drawer) drawer.classList.remove("is-cycle-out");
    }, 520);
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = window.setInterval(cycleOnce, 4000);
  };

  // Event delegation (works for clones)
  if (row) {
    row.addEventListener("click", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      stopAuto();
      selectTileElement(tile, { snap: true, smooth: true });
      startAuto();
    });

    row.addEventListener("dblclick", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      const p = PROJECTS[tile.dataset.project];
      if (p) window.open(p.link, "_blank", "noopener,noreferrer");
    });

    row.addEventListener("keydown", (e) => {
      const tile = e.target.closest(".proj-square");
      if (!tile || !row.contains(tile)) return;
      if (e.key === "Enter") {
        const p = PROJECTS[tile.dataset.project];
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
    if (prev) selectTileElement(prev, { snap: true, smooth: true });
    startAuto();
  });

  nextBtn?.addEventListener("click", () => {
    stopAuto();
    const next = getNextTile(1);
    if (next) selectTileElement(next, { snap: true, smooth: true });
    startAuto();
  });

  // Pause auto when hovering drawer
  drawer?.addEventListener("pointerenter", stopAuto);
  drawer?.addEventListener("pointerleave", startAuto);
  drawer?.addEventListener("focusin", stopAuto);
  drawer?.addEventListener("focusout", startAuto);

  // Init
  setupInfinite();
  startAuto();
})();
