(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (min, max) => min + Math.random() * (max - min);

  const root = document.documentElement;
  const body = document.body;

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const PREFERS_REDUCE = mm ? mm.matches : false;

  const CORES = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 0;
  const MEM = typeof navigator !== "undefined" ? navigator.deviceMemory : 0;

  const LOW_POWER =
    PREFERS_REDUCE ||
    (typeof MEM === "number" && MEM > 0 && MEM <= 4) ||
    (typeof CORES === "number" && CORES > 0 && CORES <= 4) ||
    window.innerWidth < 768;

  // Make FX *smooth* (not choppy), but lower particle count.
  // 60fps on normal devices, 30fps on low-power.
  const FX_TARGET_FPS = LOW_POWER ? 30 : 60;
  const FX_FRAME_MS = 1000 / FX_TARGET_FPS;

  // ===== Year =====
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== Scroll Spy =====
  const navLinks = $$(".nav-item").filter((a) => a.tagName.toLowerCase() === "a");
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
      { threshold: [0.25, 0.45, 0.6] }
    );
    sections.forEach((s) => io.observe(s.el));

    const initial = (location.hash || "").replace("#", "");
    if (initial && sections.some((s) => s.id === initial)) setActive(initial);
    else setActive(sections[0].id);
  }

  // ===== Focus cards (reveal + focus) =====
  const focusCards = $$(".focus-card");
  if (focusCards.length) {
    focusCards.forEach((el) => el.classList.add("reveal"));

    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-reveal");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );
    focusCards.forEach((el) => revealIO.observe(el));

    const focusIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle("is-focus", e.isIntersecting));
      },
      { threshold: [0.25, 0.45, 0.6], rootMargin: "-10% 0px -25% 0px" }
    );
    focusCards.forEach((el) => focusIO.observe(el));
  }

  // ===== Pane Focus Mode++ =====
  if (focusCards.length) {
    const setActiveCard = (card) => {
      focusCards.forEach((c) => c.classList.remove("is-active"));
      if (card) {
        card.classList.add("is-active");
        body.classList.add("pane-active");
      } else {
        body.classList.remove("pane-active");
      }
    };

    focusCards.forEach((card) => {
      card.addEventListener("pointerenter", () => {
        body.classList.add("pane-focus");
        focusCards.forEach((c) => c.classList.remove("is-hover"));
        card.classList.add("is-hover");
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-hover");
        body.classList.remove("pane-focus");
      });

      card.addEventListener("click", () => setActiveCard(card));
    });

    document.addEventListener("pointerdown", (e) => {
      const inCard = e.target && e.target.closest ? e.target.closest(".focus-card") : null;
      const inNav = e.target && e.target.closest ? e.target.closest(".nav-shell") : null;
      if (!inCard && !inNav) setActiveCard(null);
    });
  }

  // ===== Copy email =====
  const copyBtn = $("#copyEmailBtn");
  const EMAIL = "aghildiy@asu.edu";

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {}
    return false;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const prev = copyBtn.textContent;
      const ok = await copyText(EMAIL);
      copyBtn.textContent = ok ? "Copied ✓" : "Copy failed";
      setTimeout(() => (copyBtn.textContent = prev), 1100);
    });
  }

  // ===== Mouse smoothing + CSS var cache =====
  let vw = window.innerWidth;
  let vh = window.innerHeight;

  let mx = vw * 0.5;
  let my = vh * 0.45;

  let smx = mx;
  let smy = my;

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true }
  );

  const cache = Object.create(null);
  const setPxVar = (name, val, eps = 0.2) => {
    const prev = cache[name];
    if (prev === undefined || Math.abs(prev - val) > eps) {
      cache[name] = val;
      root.style.setProperty(`--${name}`, `${val.toFixed(1)}px`);
    }
  };

  // ===== Orb drift =====
  const orb = {
    x: rand(-0.15 * vw, 1.15 * vw),
    y: rand(-0.15 * vh, 1.15 * vh),
    tx: rand(-0.18 * vw, 1.18 * vw),
    ty: rand(-0.18 * vh, 1.18 * vh),
    speed: LOW_POWER ? 9 : 12,
  };

  const pickOrbTarget = () => {
    orb.tx = rand(-0.18 * vw, 1.18 * vw);
    orb.ty = rand(-0.18 * vh, 1.18 * vh);
  };

  // ===== FX canvas =====
  const fxCanvas = document.getElementById("bgFX");
  const fxBtn = document.getElementById("fxToggle");

  const FX_MODES = ["snow", "dust", "bokeh", "stars", "rain", "off"];
  let fxModeIndex = LOW_POWER ? FX_MODES.indexOf("off") : 0; // smooth by default

  const setFXLabel = () => {
    if (!fxBtn) return;
    const label = FX_MODES[fxModeIndex];
    fxBtn.textContent = `FX: ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  };
  setFXLabel();

  const fx = (() => {
    if (!fxCanvas || !fxCanvas.getContext) return null;
    const ctx = fxCanvas.getContext("2d");

    const state = { w: 1, h: 1, dpr: 1, particles: [] };

    const countForMode = (mode) => {
      const area = state.w * state.h;

      // noticeably reduced vs earlier versions (but still visible)
      if (mode === "off") return 0;
      if (mode === "bokeh") return clamp(Math.floor(area / (LOW_POWER ? 320000 : 240000)), 8, LOW_POWER ? 18 : 26);
      if (mode === "stars") return clamp(Math.floor(area / (LOW_POWER ? 90000 : 65000)), 20, LOW_POWER ? 90 : 140);
      if (mode === "rain") return clamp(Math.floor(area / (LOW_POWER ? 95000 : 70000)), 22, LOW_POWER ? 110 : 160);
      if (mode === "dust") return clamp(Math.floor(area / (LOW_POWER ? 170000 : 120000)), 12, LOW_POWER ? 55 : 85);
      // snow
      return clamp(Math.floor(area / (LOW_POWER ? 125000 : 85000)), 14, LOW_POWER ? 60 : 95);
    };

    const makeParticle = (mode, spawnInView = true) => {
      const x = rand(0, state.w);
      const y = spawnInView ? rand(0, state.h) : rand(-state.h, 0);

      if (mode === "rain") {
        return { t: "rain", x, y, len: rand(10, 22), w: rand(0.7, 1.2), a: rand(0.04, 0.08), vy: rand(220, 380), vx: rand(-26, 26) };
      }
      if (mode === "stars") {
        return { t: "star", x, y: rand(0, state.h), r: rand(0.6, 1.3), a: rand(0.02, 0.07), tw: rand(0.6, 1.4), phase: rand(0, Math.PI * 2) };
      }
      if (mode === "bokeh") {
        return { t: "bokeh", x, y, r: rand(10, 34), a: rand(0.010, 0.028), vy: rand(7, 12), vx: rand(-5, 5), phase: rand(0, Math.PI * 2) };
      }
      if (mode === "dust") {
        return { t: "dust", x, y, r: rand(0.6, 1.6), a: rand(0.02, 0.06), vy: rand(9, 16), vx: rand(-8, 8), wobble: rand(4, 12), phase: rand(0, Math.PI * 2) };
      }
      // snow
      return { t: "snow", x, y, r: rand(0.9, 2.0), a: rand(0.03, 0.085), vy: rand(10, 24), vx: rand(-8, 8), wobble: rand(6, 14), phase: rand(0, Math.PI * 2) };
    };

    const reset = (reseed = false) => {
      const mode = FX_MODES[fxModeIndex];
      if (reseed) state.particles = [];
      const target = countForMode(mode);
      while (state.particles.length < target) state.particles.push(makeParticle(mode, true));
      while (state.particles.length > target) state.particles.pop();
    };

    const resize = () => {
      state.w = Math.max(1, window.innerWidth);
      state.h = Math.max(1, window.innerHeight);

      // performance: lock to DPR=1 (huge win)
      state.dpr = 1;

      fxCanvas.width = Math.floor(state.w * state.dpr);
      fxCanvas.height = Math.floor(state.h * state.dpr);
      fxCanvas.style.width = `${state.w}px`;
      fxCanvas.style.height = `${state.h}px`;

      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      reset(true);
    };

    const step = (dt, now) => {
      const mode = FX_MODES[fxModeIndex];
      if (mode === "off") {
        ctx.clearRect(0, 0, state.w, state.h);
        return;
      }

      const target = countForMode(mode);
      if (state.particles.length < target) {
        for (let i = 0; i < target - state.particles.length; i++) state.particles.push(makeParticle(mode, false));
      } else if (state.particles.length > target) {
        state.particles.length = target;
      }

      ctx.clearRect(0, 0, state.w, state.h);

      if (mode === "stars") {
        for (let i = 0; i < state.particles.length; i++) {
          const p = state.particles[i];
          const tw = (Math.sin((now / 1000) * p.tw + p.phase) + 1) / 2;
          const a = p.a * (0.55 + 0.55 * tw);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fill();
        }
        return;
      }

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];

        if (p.t === "rain") {
          p.y += p.vy * dt;
          p.x += p.vx * dt;

          if (p.y > state.h + 40) {
            p.x = rand(0, state.w);
            p.y = rand(-140, -20);
          }
          if (p.x < -60) p.x = state.w + 60;
          if (p.x > state.w + 60) p.x = -60;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.04, p.y + p.len);
          ctx.strokeStyle = `rgba(255,255,255,${p.a})`;
          ctx.lineWidth = p.w;
          ctx.stroke();
          continue;
        }

        const wob = Math.sin((now / 1000) + p.phase) * (p.wobble ? p.wobble * 0.08 : 0);
        p.y += (p.vy || 0) * dt;
        p.x += (p.vx || 0) * dt + wob;

        if (p.y > state.h + 80) {
          state.particles[i] = makeParticle(mode, false);
          continue;
        }
        if (p.x < -80) p.x = state.w + 80;
        if (p.x > state.w + 80) p.x = -80;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    return { reset, step };
  })();

  const setMode = (idx) => {
    fxModeIndex = ((idx % FX_MODES.length) + FX_MODES.length) % FX_MODES.length;
    setFXLabel();
    if (fx) fx.reset(true);
  };

  if (fxBtn) fxBtn.addEventListener("click", () => setMode(fxModeIndex + 1));

  // ===== main loop =====
  let lastNow = performance.now();
  let lastFxFrame = 0;

  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;

    vw = window.innerWidth;
    vh = window.innerHeight;

    // cursor smoothing
    const k = LOW_POWER ? 0.22 : 0.16;
    smx += (mx - smx) * k;
    smy += (my - smy) * k;

    setPxVar("mx", smx);
    setPxVar("my", smy);
    setPxVar("sx", smx);
    setPxVar("sy", smy);

    // subtle parallax (small amplitude)
    const nx = (smx - vw / 2) / (vw / 2);
    const ny = (smy - vh / 2) / (vh / 2);
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    setPxVar("aurX", nx * 10 + 0.0);
    setPxVar("aurY", ny * 7 + clamp(-scrollY * 0.012, -30, 30));
    setPxVar("orbX", nx * 14 + 0.0);
    setPxVar("orbY", ny * 10 + clamp(-scrollY * 0.02, -44, 44));
    setPxVar("fxX", nx * 7 + 0.0);
    setPxVar("fxY", ny * 6 + clamp(-scrollY * 0.01, -24, 24));

    // orb random drift
    const dx = orb.tx - orb.x;
    const dy = orb.ty - orb.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < 18) pickOrbTarget();

    const step = orb.speed * dt;
    const t = Math.min(1, step / dist);
    orb.x += dx * t;
    orb.y += dy * t;

    orb.x += Math.sin(now / 2100) * 0.08;
    orb.y += Math.cos(now / 2400) * 0.08;

    setPxVar("ox", orb.x, 0.3);
    setPxVar("oy", orb.y, 0.3);

    // FX render throttle (60/30 depending device)
    if (fx && now - lastFxFrame >= FX_FRAME_MS) {
      lastFxFrame = now;
      fx.step(dt, now);
    }
  };

  requestAnimationFrame(tick);
})();