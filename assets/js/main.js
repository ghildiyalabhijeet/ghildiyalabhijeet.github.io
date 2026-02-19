(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Years
  const year = String(new Date().getFullYear());
  $("#yearA") && ($("#yearA").textContent = year);
  $("#yearB") && ($("#yearB").textContent = year);

  // Cursor spotlight (throttled)
  if (!prefersReduced) {
    let raf = null;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--spot-x", `${e.clientX}px`);
          document.documentElement.style.setProperty("--spot-y", `${e.clientY}px`);
          raf = null;
        });
      },
      { passive: true }
    );
  }

  // Toast + clipboard
  const toast = $("#toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.textContent = "";
      toast.style.opacity = "0.9";
    }, 1200);
  };

  const copyText = async (txt) => {
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      showToast("Copied ✅");
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = txt;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("Copied ✅");
    }
  };

  $$("[data-copy]").forEach((el) => {
    el.addEventListener("click", () => copyText(el.dataset.copy || ""));
  });

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

  // ===== Skills Lab =====
  const bubbles = $$(".bubble");
  const filters = $$(".filter");

  const skillName = $("#skillName");
  const skillPill = $("#skillPill");
  const skillDesc = $("#skillDesc");
  const skillsCount = $("#skillsCount");

  const LABEL = { lang: "Languages", data: "Data", ml: "ML / DL", tools: "Tools" };

  const updateInspector = (b) => {
    if (!b) return;
    const name = b.textContent.trim();
    const group = b.dataset.group || "all";
    const desc = b.dataset.desc || "—";

    skillName && (skillName.textContent = name);
    skillPill && (skillPill.textContent = LABEL[group] || "All");
    skillDesc && (skillDesc.textContent = desc);

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

  // ===== Projects =====
  const PROJECTS = {
    genai: {
      title: "Faster Diffusion",
      meta: "GenAI · Diffusion · Optimization · Python",
      desc:
        "Optimization experiments focused on speeding up diffusion pipelines while keeping output quality sharp. Built for iteration speed: measure → tune → ship.",
      bullets: [
        "Applied throughput-focused optimizations to improve generation efficiency.",
        "Tuned model architecture/pipeline knobs for better speed-quality trade-offs.",
        "Collaborated in a small team to keep changes measurable and reproducible.",
      ],
      link: "https://github.com/ghildiyalabhijeet/GenAIProject",
      accent: "59 130 246",
    },
    pollution: {
      title: "Particle Pollution (Research Paper)",
      meta: "ML · PM2.5 · Environmental analytics · PDF",
      desc:
        "A research study exploring how machine learning can model atmospheric particle pollution using PM2.5 and emission patterns.",
      bullets: [
        "Analyzed PM2.5 + carbon emission patterns to model environmental impact.",
        "Trained ML models on pollutant datasets and compared results.",
        "Packaged findings into a formal research paper deliverable.",
      ],
      link:
        "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      accent: "16 185 129",
    },
    pipeline: {
      title: "Digital Assets Analytics Pipeline",
      meta: "Analytics · ETL · Repo",
      desc:
        "An analytics pipeline repo for digital asset data — structured for ingestion → transform → analysis, with documentation living in the README.",
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
        "A Slack bot that reduces context switching by helping answer Python programming questions inside Slack — fast prompts, fast responses, fast troubleshooting.",
      bullets: [
        "Integrated Python with Slack API to create a streamlined Q&A interface.",
        "Optimized for real-time interaction and quick developer help loops.",
        "Designed to accelerate troubleshooting and reduce friction.",
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

    // accent aura
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
    const key = card.dataset.key;
    const accent = card.dataset.accent || "59 130 246";
    setPreview(key, accent);
    setDots();

    if (scroll && track) {
      card.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        inline: "start",
        block: "nearest",
      });
    }
  };

  const goTo = (idx, user = false) => {
    if (user) stopAuto();
    selectCard(idx, { scroll: true, smooth: true });
    if (user) startAuto();
  };

  const startAuto = () => {
    if (prefersReduced || !cards.length) return;
    stopAuto();
    auto = window.setInterval(() => {
      selectCard(activeIndex + 1, { scroll: true, smooth: true });
    }, 4000);
  };

  const stopAuto = () => {
    if (auto) clearInterval(auto);
    auto = null;
  };

  // Wire up deck events
  if (cards.length) {
    buildDots();
    selectCard(0, { scroll: false, smooth: false });

    cards.forEach((c, i) => {
      c.addEventListener("click", () => goTo(i, true));
      c.addEventListener("dblclick", () => {
        const p = PROJECTS[c.dataset.key];
        if (p) window.open(p.link, "_blank", "noopener,noreferrer");
      });
    });

    prevBtn && prevBtn.addEventListener("click", () => goTo(activeIndex - 1, true));
    nextBtn && nextBtn.addEventListener("click", () => goTo(activeIndex + 1, true));

    // Pause auto while interacting
    track && track.addEventListener("pointerenter", stopAuto);
    track && track.addEventListener("pointerleave", startAuto);
    preview && preview.addEventListener("pointerenter", stopAuto);
    preview && preview.addEventListener("pointerleave", startAuto);

    // When user scrolls manually, snap selection to nearest card
    if (track) {
      let t = 0;
      track.addEventListener(
        "scroll",
        () => {
          if (!cards.length) return;
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

    startAuto();
  }

  // Copy project link
  copyBtn &&
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.copy || (openEl ? openEl.href : "");
      url && copyText(url);
    });
})();