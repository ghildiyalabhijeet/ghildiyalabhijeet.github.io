(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // years
  const year = String(new Date().getFullYear());
  $("#yearA") && ($("#yearA").textContent = year);
  $("#yearB") && ($("#yearB").textContent = year);

  // toast + clipboard
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

  // scroll buttons
  $$("[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (!target) return;
      const el = document.querySelector(target);
      el && el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });

  // ===== reveal =====
  const reveals = $$(".reveal");
  if (reveals.length && !prefersReduced) {
    const rio = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.16 }
    );
    reveals.forEach((el) => rio.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ===== scroll spy (nav + rail) =====
  const navLinks = $$(".nav-link");
  const railDots = $$(".rail-dot");
  const sections = ["work", "about", "projects"].map((id) => document.getElementById(id)).filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
    railDots.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-target") === `#${id}`));
  };

  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.id);
      },
      { threshold: [0.25, 0.4, 0.55, 0.7] }
    );
    sections.forEach((s) => io.observe(s));
    setActive(sections[0].id);
  }

  // ===== background render orb =====
  const canvas = $("#bgRender");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0,
      h = 0,
      dpr = 1;

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
    const FPS = 28;
    const frameMS = 1000 / FPS;

    const loop = (t) => {
      if (t - last < frameMS) {
        requestAnimationFrame(loop);
        return;
      }
      last = t;

      ctx.clearRect(0, 0, w, h);
      const tt = t * 0.001;

      const cx = w * (0.52 + 0.30 * Math.sin(tt * 0.23));
      const cy = h * (0.44 + 0.22 * Math.sin(tt * 0.19 + 1.7));
      const r = Math.max(62, Math.min(w, h) * 0.10);

      // glow
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r * 2.1);
      glow.addColorStop(0, "rgba(90, 200, 255, 0.14)");
      glow.addColorStop(0.40, "rgba(170, 120, 255, 0.10)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - r * 2.1, cy - r * 2.1, r * 4.2, r * 4.2);
      ctx.restore();

      // body
      const hx = cx - r * 0.28 + Math.sin(tt * 1.1) * r * 0.08;
      const hy = cy - r * 0.36 + Math.cos(tt * 0.9) * r * 0.06;

      ctx.save();
      const body = ctx.createRadialGradient(hx, hy, r * 0.10, cx, cy, r);
      body.addColorStop(0, "rgba(255,255,255,0.68)");
      body.addColorStop(0.28, "rgba(255,255,255,0.20)");
      body.addColorStop(0.62, "rgba(190, 220, 255, 0.11)");
      body.addColorStop(1, "rgba(255,255,255,0.04)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // rim
      ctx.save();
      ctx.lineWidth = 2.1;
      const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      rim.addColorStop(0, "rgba(255, 85, 205, 0.58)");
      rim.addColorStop(0.35, "rgba(255, 210, 120, 0.46)");
      rim.addColorStop(0.65, "rgba(80, 220, 255, 0.58)");
      rim.addColorStop(1, "rgba(170, 120, 255, 0.58)");

      ctx.strokeStyle = rim;
      ctx.shadowColor = "rgba(90, 200, 255, 0.18)";
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  // ===== Skills =====
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

  // ===== Projects (Marquee) =====
  const PROJECTS = {
    genai: {
      title: "Faster Diffusion",
      meta: "GenAI · Diffusion · Optimization · Python",
      desc: "Optimization experiments focused on speeding up diffusion pipelines while keeping output quality sharp.",
      bullets: [
        "Throughput-focused optimizations to improve generation efficiency.",
        "Tuned pipeline/architecture knobs for better speed-quality trade-offs.",
        "Kept changes measurable and reproducible.",
      ],
      link: "https://github.com/ghildiyalabhjeet/GenAIProject".replace("abhjeet", "abhijeet"),
      accent: "59 130 246",
    },
    pollution: {
      title: "Particle Pollution (Research Paper)",
      meta: "ML · PM2.5 · Environmental analytics · PDF",
      desc: "Research exploring how ML can model atmospheric particle pollution using PM2.5 and emission patterns.",
      bullets: [
        "Analyzed PM2.5 + carbon emission patterns to model environmental impact.",
        "Ran ML models on pollutant datasets and compared results.",
        "Compiled findings into a research paper deliverable.",
      ],
      link:
        "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      accent: "16 185 129",
    },
    pipeline: {
      title: "Digital Assets Analytics Pipeline",
      meta: "Analytics · ETL · Repo",
      desc: "Pipeline repo structured for ingestion → transform → analysis, with documentation living in the README.",
      bullets: [
        "End-to-end pipeline structure for repeatable analytics workflows.",
        "Transformations kept explicit and auditable.",
        "Open the repo for architecture + setup details.",
      ],
      link: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      accent: "234 179 8",
    },
    slackbot: {
      title: "Slack Python Q&A Bot",
      meta: "Python · Slack API · Automation",
      desc: "Slack bot that answers Python questions inside Slack to reduce context switching and speed up troubleshooting.",
      bullets: [
        "Integrated Python with Slack API for streamlined Q&A.",
        "Optimized for real-time interaction and rapid feedback loops.",
        "Built to reduce friction and accelerate troubleshooting.",
      ],
      link: "https://github.com/AII-projects/slackbot",
      accent: "236 72 153",
    },
  };

  const marquee = $("#projMarquee");
  const marqueeTrack = $("#marqueeTrack");
  const marqueeGroup = $("#marqueeGroup");

  const preview = $("#projPreview");
  const titleEl = $("#projTitle");
  const metaEl = $("#projMeta");
  const descEl = $("#projDesc");
  const bulletsEl = $("#projBullets");
  const openEl = $("#projOpen");
  const copyBtn = $("#projCopy");

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

  const selectCard = (card) => {
    if (!card) return;
    const key = card.dataset.key;
    const accent = card.dataset.accent || "59 130 246";

    // highlight all duplicates of the same key
    $$(".mcard").forEach((c) => c.classList.toggle("is-selected", c.dataset.key === key));
    marquee && marquee.style.setProperty("--accent", accent);

    setPreview(key, accent);
  };

  // clone the marquee group once => 2 groups => -50% animation is seamless
  if (marqueeTrack && marqueeGroup && !prefersReduced) {
    const clone = marqueeGroup.cloneNode(true);
    clone.id = "marqueeGroupClone";
    marqueeTrack.appendChild(clone);
  }

  // interactions
  const bindCards = () => {
    const cards = $$(".mcard");
    cards.forEach((c) => {
      c.addEventListener("click", () => {
        // “tap pause” for touch users
        if (marquee) {
          marquee.classList.add("is-paused");
          clearTimeout(bindCards._t);
          bindCards._t = setTimeout(() => marquee.classList.remove("is-paused"), 1600);
        }
        selectCard(c);
      });

      c.addEventListener("dblclick", () => {
        const p = PROJECTS[c.dataset.key];
        if (p) window.open(p.link, "_blank", "noopener,noreferrer");
      });
    });
  };

  bindCards();

  copyBtn &&
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.copy || (openEl ? openEl.href : "");
      url && copyText(url);
    });

  // init selection
  const first = $(".mcard");
  first && selectCard(first);

  // optional: slightly randomize marquee speed per load (subtle)
  if (!prefersReduced) {
    const s = 16 + Math.floor(Math.random() * 6); // 16..21
    document.documentElement.style.setProperty("--marquee-duration", `${s}s`);
  }
})();