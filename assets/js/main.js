(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Years
  const year = String(new Date().getFullYear());
  $("#yearA") && ($("#yearA").textContent = year);
  $("#yearB") && ($("#yearB").textContent = year);

  // Toast + clipboard
  const toast = $("#toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.textContent = ""), 1100);
  };

  const copyText = async (txt) => {
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      showToast("Copied ✅");
    } catch {
      const input = document.createElement("input");
      input.value = txt;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("Copied ✅");
    }
  };

  $$("[data-copy]").forEach((el) => el.addEventListener("click", () => copyText(el.dataset.copy || "")));

  // Scroll spy (nav active state)
  const links = $$(".nav-link");
  const sections = links
    .map((a) => (a.getAttribute("href") || "").replace("#", ""))
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  };

  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        setActive(best.target.id);
      },
      { threshold: [0.25, 0.4, 0.55, 0.7] }
    );
    sections.forEach((s) => io.observe(s));
    setActive(sections[0].id);
  }

  // =========================
  // Background "render" (glass orb) — smooth + lightweight
  // =========================
  const canvas = $("#bgRender");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let last = 0;
    const loop = (t) => {
      // cap ~30fps to stay smooth on GitHub Pages
      if (t - last < 33) {
        requestAnimationFrame(loop);
        return;
      }
      last = t;

      ctx.clearRect(0, 0, w, h);

      const tt = t * 0.001;

      // Orb path (slow roam)
      const cx = w * (0.52 + 0.30 * Math.sin(tt * 0.23));
      const cy = h * (0.44 + 0.22 * Math.sin(tt * 0.19 + 1.7));

      const r = Math.max(70, Math.min(w, h) * 0.11);

      // Soft outer glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r * 2.2);
      glow.addColorStop(0, "rgba(90, 200, 255, 0.16)");
      glow.addColorStop(0.35, "rgba(170, 120, 255, 0.10)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
      ctx.restore();

      // Main glass body
      const hx = cx - r * 0.30 + Math.sin(tt * 1.1) * r * 0.08;
      const hy = cy - r * 0.38 + Math.cos(tt * 0.9) * r * 0.06;

      ctx.save();
      const body = ctx.createRadialGradient(hx, hy, r * 0.10, cx, cy, r);
      body.addColorStop(0, "rgba(255,255,255,0.70)");
      body.addColorStop(0.28, "rgba(255,255,255,0.22)");
      body.addColorStop(0.65, "rgba(190, 220, 255, 0.12)");
      body.addColorStop(1, "rgba(255,255,255,0.04)");

      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Prismatic neon rim
      ctx.save();
      ctx.lineWidth = 2.2;
      const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      rim.addColorStop(0, "rgba(255, 85, 205, 0.62)");
      rim.addColorStop(0.35, "rgba(255, 210, 120, 0.50)");
      rim.addColorStop(0.65, "rgba(80, 220, 255, 0.62)");
      rim.addColorStop(1, "rgba(170, 120, 255, 0.62)");

      ctx.strokeStyle = rim;
      ctx.shadowColor = "rgba(90, 200, 255, 0.22)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Specular highlight sweep
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const hl = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.9);
      hl.addColorStop(0, "rgba(255,255,255,0.18)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  // =========================
  // Skills Lab (same behavior)
  // =========================
  const bubbles = $$(".bubble");
  const filters = $$(".filter");

  const skillName = $("#skillName");
  const skillPill = $("#skillPill");
  const skillDesc = $("#skillDesc");
  const skillsCount = $("#skillsCount");

  const LABEL = { lang: "Languages", data: "Data", ml: "ML / DL", tools: "Tools" };

  const updateInspector = (b) => {
    if (!b) return;
    skillName && (skillName.textContent = b.textContent.trim());
    skillPill && (skillPill.textContent = LABEL[b.dataset.group] || "All");
    skillDesc && (skillDesc.textContent = b.dataset.desc || "—");
    bubbles.forEach((x) => x.classList.toggle("is-selected", x === b));
  };

  const updateCount = () => {
    if (!skillsCount) return;
    const visible = bubbles.filter((b) => !b.classList.contains("is-dim")).length;
    skillsCount.textContent = `${visible} / ${bubbles.length}`;
  };

  const applyFilter = (group) => {
    filters.forEach((f) => f.classList.toggle("is-active", f.dataset.filter === group));
    bubbles.forEach((b) => {
      const dim = !(group === "all" || b.dataset.group === group);
      b.classList.toggle("is-dim", dim);
    });
    updateCount();
    const first = bubbles.find((b) => !b.classList.contains("is-dim"));
    first && updateInspector(first);
  };

  filters.forEach((f) => f.addEventListener("click", () => applyFilter(f.dataset.filter || "all")));
  bubbles.forEach((b) => {
    b.addEventListener("mouseenter", () => updateInspector(b));
    b.addEventListener("click", () => updateInspector(b));
  });
  applyFilter("all");

  // =========================
  // Projects (1 visible card, auto spotlight)
  // =========================
  const PROJECTS = {
    genai: {
      title: "Faster Diffusion",
      meta: "GenAI · Diffusion · Optimization · Python",
      desc:
        "Optimization experiments focused on speeding up diffusion pipelines while keeping output quality sharp.",
      bullets: [
        "Applied throughput-focused optimizations to improve generation efficiency.",
        "Tuned pipeline/architecture knobs for better speed-quality trade-offs.",
        "Kept changes measurable and reproducible.",
      ],
      link: "https://github.com/ghildiyalabhjeet/GenAIProject",
      accent: "59 130 246",
    },
    pollution: {
      title: "Particle Pollution (Research Paper)",
      meta: "ML · PM2.5 · Environmental analytics · PDF",
      desc:
        "Research exploring how ML can model atmospheric particle pollution using PM2.5 and emission patterns.",
      bullets: [
        "Analyzed PM2.5 + carbon emission patterns for environmental impact modeling.",
        "Ran ML models on pollutant datasets and compared results.",
        "Packaged findings into a research paper deliverable.",
      ],
      link:
        "https://github.com/ghildiyalabhjeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      accent: "16 185 129",
    },
    pipeline: {
      title: "Digital Assets Analytics Pipeline",
      meta: "Analytics · ETL · Repo",
      desc:
        "Pipeline repo structured for ingestion → transform → analysis, with documentation living in the README.",
      bullets: [
        "End-to-end pipeline structure for repeatable analytics workflows.",
        "Designed to keep transformations explicit and auditable.",
        "Open the repo for architecture + setup details.",
      ],
      link: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      accent: "234 179 8",
    },
    slackbot: {
      title: "Slack Python Q&A Bot",
      meta: "Python · Slack API · Automation",
      desc:
        "Slack bot that reduces context switching by answering Python questions inside Slack for faster troubleshooting.",
      bullets: [
        "Integrated Python with Slack API for streamlined Q&A.",
        "Optimized for real-time interaction and quick feedback loops.",
        "Designed to reduce friction and accelerate troubleshooting.",
      ],
      link: "https://github.com/AII-projects/slackbot",
      accent: "236 72 153",
    },
  };

  const track = $("#projTrack");
  const cards = track ? $$(".pcard", track) : [];
  const dotsWrap = $("#projDots");

  const preview = $("#projPreview");
  const titleEl = $("#projTitle");
  const metaEl = $("#projMeta");
  const descEl = $("#projDesc");
  const bulletsEl = $("#projBullets");
  const openEl = $("#projOpen");
  const copyBtn = $("#projCopy");

  const prevBtn = $("#projPrev");
  const nextBtn = $("#projNext");

  let activeIndex = 0;
  let auto = null;

  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dotbtn";
      b.type = "button";
      b.setAttribute("aria-label", `Go to project ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
  };

  const setDots = () => {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("is-active", i === activeIndex));
  };

  const setPreview = (key, accent) => {
    const p = PROJECTS[key];
    if (!p) return;

    titleEl && (titleEl.textContent = p.title);
    metaEl && (metaEl.textContent = p.meta);
    descEl && (descEl.textContent = p.desc);

    if (bulletsEl) {
      bulletsEl.innerHTML = "";
      p.bullets.forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x;
        bulletsEl.appendChild(li);
      });
    }

    if (openEl) openEl.href = p.link;
    if (copyBtn) copyBtn.dataset.copy = p.link;

    const a = accent || p.accent || "59 130 246";
    preview && preview.style.setProperty("--accent", a);
  };

  const selectCard = (idx, { scroll = false, smooth = true } = {}) => {
    if (!cards.length) return;
    activeIndex = (idx + cards.length) % cards.length;

    cards.forEach((c, i) => {
      c.classList.toggle("is-selected", i === activeIndex);
      const accent = c.dataset.accent || "59 130 246";
      c.style.setProperty("--accent-card", accent);
    });

    const card = cards[activeIndex];
    setPreview(card.dataset.key, card.dataset.accent);
    setDots();

    if (scroll && track) {
      card.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        inline: "start",
        block: "nearest",
      });
    }
  };

  const stopAuto = () => {
    if (auto) clearInterval(auto);
    auto = null;
  };

  const startAuto = () => {
    if (prefersReduced || !cards.length) return;
    stopAuto();
    auto = window.setInterval(() => {
      selectCard(activeIndex + 1, { scroll: true, smooth: true });
    }, 4000);
  };

  const goTo = (idx, user = false) => {
    if (user) stopAuto();
    selectCard(idx, { scroll: true, smooth: true });
    if (user) startAuto();
  };

  if (cards.length) {
    buildDots();
    selectCard(0, { scroll: false, smooth: false });
    startAuto();

    cards.forEach((c, i) => {
      c.addEventListener("click", () => goTo(i, true));
      c.addEventListener("dblclick", () => {
        const p = PROJECTS[c.dataset.key];
        if (p) window.open(p.link, "_blank", "noopener,noreferrer");
      });
    });

    prevBtn && prevBtn.addEventListener("click", () => goTo(activeIndex - 1, true));
    nextBtn && nextBtn.addEventListener("click", () => goTo(activeIndex + 1, true));

    // Pause auto when hovering deck/preview
    track && track.addEventListener("pointerenter", stopAuto);
    track && track.addEventListener("pointerleave", startAuto);
    preview && preview.addEventListener("pointerenter", stopAuto);
    preview && preview.addEventListener("pointerleave", startAuto);

    // On manual scroll, snap selection to nearest card (still 1-card)
    if (track) {
      let t = 0;
      track.addEventListener(
        "scroll",
        () => {
          clearTimeout(t);
          t = window.setTimeout(() => {
            const left = track.scrollLeft;
            let best = 0;
            let bestDist = Infinity;
            cards.forEach((c, i) => {
              const d = Math.abs(c.offsetLeft - left);
              if (d < bestDist) {
                bestDist = d;
                best = i;
              }
            });
            selectCard(best, { scroll: false });
          }, 110);
        },
        { passive: true }
      );
    }
  }

  copyBtn &&
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.copy || (openEl ? openEl.href : "");
      url && copyText(url);
    });
})();