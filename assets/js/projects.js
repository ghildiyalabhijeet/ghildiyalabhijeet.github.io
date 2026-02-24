(() => {
  const root = document.getElementById("projectsRoot");
  if (!root) return;

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const prefersReduce = mm ? mm.matches : false;

  const AUTO_MS = prefersReduce ? 0 : 4000;
  const TICK_MS = 70;

  const TECH = {
    Python: { abbr: "Py", rgb: "55, 118, 171" },
    SQL: { abbr: "SQL", rgb: "59, 130, 246" },
    PyTorch: { abbr: "PT", rgb: "238, 83, 47" },
    "scikit-learn": { abbr: "SK", rgb: "249, 115, 22" },
    Slack: { abbr: "Sl", rgb: "82, 168, 64" },
    TensorFlow: { abbr: "TF", rgb: "255, 125, 0" },
    "Power BI": { abbr: "BI", rgb: "250, 204, 21" },
  };

  // NOTE: Your thumbnails go here:
  // assets/img/1.webp ... assets/img/4.webp
  const PROJECTS = [
    {
      id: "diffusion",
      title: "Faster Diffusion",
      year: "2025",
      url: "https://github.com/ghildiyalabhijeet/GenAIProject",
      accentRGB: "250, 204, 21",
      thumb: "assets/img/1.webp",
      stack: ["Python", "PyTorch"],
    },
    {
      id: "pollution",
      title: "Particle Pollution",
      year: "2022",
      url: "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      accentRGB: "34, 197, 94",
      thumb: "assets/img/2.webp",
      stack: ["Python", "scikit-learn"],
    },
    {
      id: "assets",
      title: "Digital Assets Pipeline",
      year: "Repo",
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      accentRGB: "72, 155, 255",
      thumb: "assets/img/3.webp",
      stack: ["Python", "SQL"],
    },
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      year: "2025",
      url: "https://github.com/AII-projects/slackbot",
      accentRGB: "167, 139, 250",
      thumb: "assets/img/4.webp",
      stack: ["Python", "Slack"],
    },
  ];

  const n = PROJECTS.length;
  const clampIndex = (i) => ((i % n) + n) % n;

  // Preload thumbnails (only 4 — cheap, prevents “blank” slide)
  PROJECTS.forEach((p) => {
    const img = new Image();
    img.decoding = "async";
    img.src = p.thumb;
  });

  const projectsH2IconSVG = `
    <span class="pc-h2Icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M4 5h6v6H4z"></path>
        <path d="M14 5h6v6h-6z"></path>
        <path d="M4 13h6v6H4z"></path>
        <path d="M14 13h6v6h-6z"></path>
      </svg>
    </span>
  `;

  const openIconSVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3h7v7"></path>
      <path d="M10 14L21 3"></path>
      <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"></path>
    </svg>
  `;

  const techIconHTML = (name, fallbackRGB) => {
    const meta = TECH[name] || { abbr: name.slice(0, 2).toUpperCase(), rgb: fallbackRGB };
    const rgb = meta.rgb || fallbackRGB;
    return `<span class="pc-techIcon mono" style="--t:${rgb}" title="${name}" aria-label="${name}" role="img">${meta.abbr}</span>`;
  };

  // Build markup once
  root.innerHTML = `
    <div class="pc-wrap" tabindex="0" role="region" aria-label="Projects slideshow">
      <div class="pc-head">
        <div class="pc-titleRow">
          <h2>${projectsH2IconSVG}Projects</h2>
          <div class="pc-controls">
            <button class="pc-ctrl" type="button" data-action="prev" aria-label="Previous project">Prev</button>
            <button class="pc-ctrl" type="button" data-action="next" aria-label="Next project">Next</button>
            <button class="pc-ctrl" type="button" data-action="toggle" aria-label="Pause / play">⏸</button>
          </div>
        </div>
        <p class="pc-hint mono">Auto 4s · click pauses · double‑click opens repo</p>
      </div>

      <div class="pc-stage">
        <div class="pc-progress" aria-hidden="true">
          ${PROJECTS.map(() => `<div class="pc-seg"><div class="pc-fill"></div></div>`).join("")}
        </div>

        <div class="pc-viewport">
          <div class="pc-track">
            ${PROJECTS.map((p, idx) => {
              const stack = (p.stack || []).slice(0, 6);
              return `
                <div class="pc-slide">
                  <button
                    class="pc-card"
                    type="button"
                    data-index="${idx}"
                    style="--accent:${p.accentRGB}"
                    aria-label="${p.title}. Click to pause. Double-click to open."
                    title="Click to pause · Double‑click to open"
                  >
                    <div class="pc-media">
                      <img class="pc-img" src="${p.thumb}" alt="${p.title} thumbnail" loading="lazy" decoding="async"
                           onerror="this.style.display='none'"/>
                      <div class="pc-mediaOverlay"></div>

                      <div class="pc-openHint mono" aria-hidden="true">
                        ${openIconSVG} Open repo
                      </div>

                      <div class="pc-bottomBar">
                        <div class="pc-bottomTop">
                          <div class="pc-title">${p.title}</div>
                          <div class="pc-year mono">${p.year}</div>
                        </div>
                        <div class="pc-techRow">
                          ${stack.map((t) => techIconHTML(t, p.accentRGB)).join("")}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>

      <div class="pc-dots" role="tablist" aria-label="Select project">
        ${PROJECTS.map((p, idx) => `<button class="pc-dot" type="button" data-index="${idx}" aria-label="Go to ${p.title}" role="tab"></button>`).join("")}
      </div>

      <div class="pc-film" role="list" aria-label="Project thumbnails">
        ${PROJECTS.map((p, idx) => `
          <button class="pc-thumb" type="button" role="listitem" data-index="${idx}" style="--accent:${p.accentRGB}"
                  aria-label="${p.title} thumbnail" title="${p.title} — click to select · double‑click to open">
            <img class="pc-thumbImg" src="${p.thumb}" alt="" loading="lazy" decoding="async"
                 onerror="this.style.display='none'"/>
            <div class="pc-thumbOverlay"></div>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  const wrap = root.querySelector(".pc-wrap");
  const track = root.querySelector(".pc-track");
  const fills = Array.from(root.querySelectorAll(".pc-fill"));
  const cards = Array.from(root.querySelectorAll(".pc-card"));
  const dots = Array.from(root.querySelectorAll(".pc-dot"));
  const thumbs = Array.from(root.querySelectorAll(".pc-thumb"));

  const btnPrev = root.querySelector('[data-action="prev"]');
  const btnNext = root.querySelector('[data-action="next"]');
  const btnToggle = root.querySelector('[data-action="toggle"]');

  let active = 0;
  let paused = false;
  let start = performance.now();
  let progress = 0;

  const open = (url) => url && window.open(url, "_blank", "noopener,noreferrer");

  const setToggleUI = () => {
    if (!btnToggle) return;
    btnToggle.classList.toggle("is-on", paused);
    btnToggle.textContent = paused ? "▶" : "⏸";
    btnToggle.setAttribute("aria-label", paused ? "Resume auto switch" : "Pause auto switch");
  };

  const resetProgress = () => {
    start = performance.now();
    progress = 0;
    updateProgress();
  };

  const updateProgress = () => {
    fills.forEach((fill, i) => {
      const w = i < active ? 100 : i === active ? Math.round(progress * 100) : 0;
      fill.style.width = `${w}%`;
    });
  };

  const applyActive = () => {
    track.style.transform = `translate3d(${-active * 100}%, 0, 0)`;

    cards.forEach((c, i) => c.classList.toggle("is-active", i === active));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === active));

    dots.forEach((d, i) => d.setAttribute("aria-selected", i === active ? "true" : "false"));

    updateProgress();
  };

  const setActive = (idx, userAction = false) => {
    active = clampIndex(idx);
    applyActive();
    resetProgress();
    if (userAction) {
      paused = true;
      setToggleUI();
    }
  };

  const next = (userAction = false) => setActive(active + 1, userAction);
  const prev = (userAction = false) => setActive(active - 1, userAction);

  // click/pause behaviors
  btnPrev && btnPrev.addEventListener("click", () => prev(true));
  btnNext && btnNext.addEventListener("click", () => next(true));

  btnToggle &&
    btnToggle.addEventListener("click", () => {
      if (!AUTO_MS) return;
      paused = !paused;
      setToggleUI();
      resetProgress();
    });

  // Card events (click pauses, dblclick opens)
  cards.forEach((card) => {
    const idx = Number(card.dataset.index || "0");
    card.addEventListener("click", () => setActive(idx, true));
    card.addEventListener("dblclick", () => open(PROJECTS[idx].url));
  });

  // Dot events
  dots.forEach((dot) => {
    const idx = Number(dot.dataset.index || "0");
    dot.addEventListener("click", () => setActive(idx, true));
  });

  // Thumb events (dblclick opens)
  thumbs.forEach((thumb) => {
    const idx = Number(thumb.dataset.index || "0");
    thumb.addEventListener("click", () => setActive(idx, true));
    thumb.addEventListener("dblclick", () => open(PROJECTS[idx].url));
  });

  // Keyboard
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev(true);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next(true);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      open(PROJECTS[active].url);
    }
    if (e.key === " ") {
      e.preventDefault();
      if (!AUTO_MS) return;
      paused = !paused;
      setToggleUI();
      resetProgress();
    }
  });

  // Autoplay tick (interval only; cheap)
  if (AUTO_MS) {
    window.setInterval(() => {
      if (paused) return;

      const now = performance.now();
      const p = (now - start) / AUTO_MS;

      if (p >= 1) {
        next(false);
      } else {
        progress = p;
        updateProgress();
      }
    }, TICK_MS);
  } else {
    // reduced motion: default paused + hide toggle label if you want
    paused = true;
  }

  // Init
  setToggleUI();
  applyActive();
})();