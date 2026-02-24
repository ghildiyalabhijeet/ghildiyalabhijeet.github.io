(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const prefersReduce = mm ? mm.matches : false;

  const MOTION = prefersReduce ? 0.55 : 1;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
      { threshold: [0.25, 0.4, 0.55, 0.7] }
    );

    sections.forEach((s) => io.observe(s.el));

    const initial = (location.hash || "").replace("#", "");
    if (initial && sections.some((s) => s.id === initial)) setActive(initial);
    else setActive(sections[0].id);
  }

  // ===== Focus Cards (reveal + in-view glow) =====
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
        entries.forEach((e) => {
          e.target.classList.toggle("is-focus", e.isIntersecting);
        });
      },
      { threshold: [0.25, 0.45, 0.6], rootMargin: "-10% 0px -25% 0px" }
    );

    focusCards.forEach((el) => focusIO.observe(el));
  }

  // ===== Pane Focus Mode++ (hover spotlight + active ring) =====
  if (focusCards.length) {
    const body = document.body;

    const clearHover = () => {
      focusCards.forEach((c) => c.classList.remove("is-hover"));
      body.classList.remove("pane-focus");
    };

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

    window.addEventListener("blur", () => {
      clearHover();
      setActiveCard(null);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") clearHover();
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

  // ===== Mouse tracking for cursor glow + spotlight + parallax =====
  const root = document.documentElement;

  let vw = window.innerWidth;
  let vh = window.innerHeight;

  let mx = vw * 0.5;
  let my = vh * 0.45;

  let smx = mx;
  let smy = my;

  let sx = mx;
  let sy = my;
  let ssx = sx;
  let ssy = sy;

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      sx = e.clientX;
      sy = e.clientY;
    },
    { passive: true }
  );

  // ===== Floating orb path =====
  {
    const rand = (min, max) => min + Math.random() * (max - min);

    let w = vw;
    let h = vh;

    let x = rand(-0.15 * w, 1.15 * w);
    let y = rand(-0.15 * h, 1.15 * h);
    let tx = rand(-0.18 * w, 1.18 * w);
    let ty = rand(-0.18 * h, 1.18 * h);

    const speed = 14 * MOTION;
    const pickTarget = () => {
      tx = rand(-0.18 * w, 1.18 * w);
      ty = rand(-0.18 * h, 1.18 * h);
    };

    root.style.setProperty("--ox", `${x.toFixed(1)}px`);
    root.style.setProperty("--oy", `${y.toFixed(1)}px`);

    let last = performance.now();

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < 18) pickTarget();

      const stepDist = speed * dt;
      const t = Math.min(1, stepDist / dist);
      x += dx * t;
      y += dy * t;

      x += Math.sin(now / 1800) * 0.08;
      y += Math.cos(now / 2200) * 0.08;

      root.style.setProperty("--ox", `${x.toFixed(1)}px`);
      root.style.setProperty("--oy", `${y.toFixed(1)}px`);

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);

    window.addEventListener(
      "resize",
      () => {
        w = window.innerWidth;
        h = window.innerHeight;
        pickTarget();
      },
      { passive: true }
    );
  }

  // ===== FX Canvas (Snow/Dust/Bokeh/Stars/Rain) =====
  const fxCanvas = document.getElementById("bgFX");
  const fxBtn = document.getElementById("fxToggle");

  const FX_MODES = ["snow", "dust", "bokeh", "stars", "rain"];
  let fxModeIndex = 0;

  const setFXLabel = () => {
    if (!fxBtn) return;
    const label = FX_MODES[fxModeIndex];
    fxBtn.textContent = `FX: ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  };
  setFXLabel();

  let fxSystem = null;

  if (fxBtn) {
    fxBtn.addEventListener("click", () => {
      fxModeIndex = (fxModeIndex + 1) % FX_MODES.length;
      setFXLabel();
      if (fxSystem) fxSystem.reset(true);
    });
  }

  window.addEventListener("keydown", (e) => {
    if ((e.key || "").toLowerCase() !== "f") return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    fxModeIndex = (fxModeIndex + 1) % FX_MODES.length;
    setFXLabel();
    if (fxSystem) fxSystem.reset(true);
  });

  if (fxCanvas && fxCanvas.getContext) {
    const ctx = fxCanvas.getContext("2d");
    const rand = (min, max) => min + Math.random() * (max - min);

    const state = {
      w: 1,
      h: 1,
      dpr: Math.min(2, window.devicePixelRatio || 1),
      particles: [],
      last: performance.now(),
    };

    const computeCount = () => {
      const area = state.w * state.h;
      const mode = FX_MODES[fxModeIndex];

      if (mode === "bokeh") return clamp(Math.floor(area / 52000), 20, 60);
      if (mode === "stars") return clamp(Math.floor(area / 16000), 80, 240);
      if (mode === "rain") return clamp(Math.floor(area / 12000), 80, 220);
      if (mode === "dust") return clamp(Math.floor(area / 26000), 50, 140);
      return clamp(Math.floor(area / 24000), 60, 160);
    };

    const makeParticle = (spawnInView = true) => {
      const mode = FX_MODES[fxModeIndex];

      if (mode === "rain") {
        return {
          t: "rain",
          x: rand(0, state.w),
          y: spawnInView ? rand(0, state.h) : rand(-state.h, 0),
          len: rand(10, 26),
          w: rand(0.7, 1.4),
          a: rand(0.05, 0.12),
          vy: rand(280, 460) * MOTION,
          vx: rand(-40, 40) * MOTION,
        };
      }

      if (mode === "stars") {
        return {
          t: "star",
          x: rand(0, state.w),
          y: rand(0, state.h),
          r: rand(0.6, 1.4),
          a: rand(0.03, 0.10),
          tw: rand(0.6, 1.6),
          phase: rand(0, Math.PI * 2),
        };
      }

      if (mode === "bokeh") {
        return {
          t: "bokeh",
          x: rand(0, state.w),
          y: spawnInView ? rand(0, state.h) : rand(-state.h, 0),
          r: rand(10, 46),
          a: rand(0.018, 0.05),
          vy: rand(8, 16) * MOTION,
          vx: rand(-6, 6) * MOTION,
          phase: rand(0, Math.PI * 2),
        };
      }

      if (mode === "dust") {
        return {
          t: "dust",
          x: rand(0, state.w),
          y: spawnInView ? rand(0, state.h) : rand(-state.h, 0),
          r: rand(0.6, 1.8),
          a: rand(0.03, 0.10),
          vy: rand(10, 22) * MOTION,
          vx: rand(-10, 10) * MOTION,
          wobble: rand(4, 18),
          phase: rand(0, Math.PI * 2),
        };
      }

      return {
        t: "snow",
        x: rand(0, state.w),
        y: spawnInView ? rand(0, state.h) : rand(-state.h, 0),
        r: rand(0.9, 2.4),
        a: rand(0.04, 0.14),
        vy: rand(14, 34) * MOTION,
        vx: rand(-10, 10) * MOTION,
        wobble: rand(6, 20),
        phase: rand(0, Math.PI * 2),
      };
    };

    const resize = () => {
      state.w = Math.max(1, window.innerWidth);
      state.h = Math.max(1, window.innerHeight);
      state.dpr = Math.min(2, window.devicePixelRatio || 1);

      fxCanvas.width = Math.floor(state.w * state.dpr);
      fxCanvas.height = Math.floor(state.h * state.dpr);
      fxCanvas.style.width = `${state.w}px`;
      fxCanvas.style.height = `${state.h}px`;

      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

      const target = computeCount();
      while (state.particles.length < target) state.particles.push(makeParticle(true));
      while (state.particles.length > target) state.particles.pop();
    };

    const reset = (reseed = false) => {
      if (reseed) state.particles = [];
      resize();
    };

    const draw = (now) => {
      const dt = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;

      const mode = FX_MODES[fxModeIndex];

      ctx.clearRect(0, 0, state.w, state.h);

      const target = computeCount();
      if (state.particles.length < target) {
        for (let i = 0; i < target - state.particles.length; i++) state.particles.push(makeParticle(false));
      } else if (state.particles.length > target) {
        state.particles.length = target;
      }

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
        requestAnimationFrame(draw);
        return;
      }

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];

        if (p.t === "rain") {
          p.y += p.vy * dt;
          p.x += p.vx * dt;

          if (p.y > state.h + 40) {
            p.x = rand(0, state.w);
            p.y = rand(-120, -20);
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
          state.particles[i] = makeParticle(false);
          continue;
        }
        if (p.x < -80) p.x = state.w + 80;
        if (p.x > state.w + 80) p.x = -80;

        if (p.t === "bokeh") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(255,255,255,${p.a})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(draw);

    fxSystem = { reset };
  }

  // ===== Parallax + panel depth =====
  const cardSeeds = focusCards.map((el, i) => ({ el, seed: (Math.random() * 1000 + i * 13.37) % 1000 }));

  const updateViewport = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
  };
  window.addEventListener("resize", updateViewport, { passive: true });

  let lastDepthUpdate = 0;

  const updateCardDepth = () => {
    const now = performance.now();
    if (now - lastDepthUpdate < 34) return;
    lastDepthUpdate = now;

    for (let i = 0; i < cardSeeds.length; i++) {
      const el = cardSeeds[i].el;
      const rect = el.getBoundingClientRect();
      const inView = rect.bottom > -40 && rect.top < vh + 40;

      if (!inView) {
        el.style.setProperty("--tiltX", "0deg");
        el.style.setProperty("--tiltY", "0deg");
        el.style.setProperty("--z", "0px");
        el.style.setProperty("--lift", "0px");
        continue;
      }

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (cx - vw / 2) / (vw / 2);
      const dy = (cy - vh / 2) / (vh / 2);

      const tiltX = clamp(dy * -3.8, -4.2, 4.2);
      const tiltY = clamp(dx * 2.6, -3.2, 3.2);

      const centerWeight = 1 - clamp(Math.abs(dy), 0, 1);
      const z = centerWeight * 26;
      const lift = -z * 0.16;

      el.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
      el.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
      el.style.setProperty("--z", `${z.toFixed(1)}px`);
      el.style.setProperty("--lift", `${lift.toFixed(1)}px`);
    }
  };

  let raf = 0;

  const tick = (now) => {
    raf = 0;

    const k = 0.12 * MOTION;
    smx += (mx - smx) * k;
    smy += (my - smy) * k;

    const ks = 0.085 * MOTION;
    ssx += (sx - ssx) * ks;
    ssy += (sy - ssy) * ks;

    root.style.setProperty("--mx", `${smx.toFixed(1)}px`);
    root.style.setProperty("--my", `${smy.toFixed(1)}px`);
    root.style.setProperty("--sx", `${ssx.toFixed(1)}px`);
    root.style.setProperty("--sy", `${ssy.toFixed(1)}px`);

    const nx = (smx - vw / 2) / (vw / 2);
    const ny = (smy - vh / 2) / (vh / 2);

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    const sA = clamp(-scrollY * 0.02, -60, 60);
    const sO = clamp(-scrollY * 0.035, -90, 90);
    const sF = clamp(-scrollY * 0.015, -45, 45);

    const aurX = nx * 18;
    const aurY = ny * 12 + sA;

    const orbX = nx * 30;
    const orbY = ny * 20 + sO;

    const fxX = nx * 12;
    const fxY = ny * 10 + sF;

    root.style.setProperty("--aurX", `${aurX.toFixed(1)}px`);
    root.style.setProperty("--aurY", `${aurY.toFixed(1)}px`);
    root.style.setProperty("--orbX", `${orbX.toFixed(1)}px`);
    root.style.setProperty("--orbY", `${orbY.toFixed(1)}px`);
    root.style.setProperty("--fxX", `${fxX.toFixed(1)}px`);
    root.style.setProperty("--fxY", `${fxY.toFixed(1)}px`);

    const t = now / 1000;
    for (let i = 0; i < cardSeeds.length; i++) {
      const { el, seed } = cardSeeds[i];

      let amp = 0.35;
      if (el.classList.contains("is-focus")) amp = 0.65;
      if (el.classList.contains("is-hover")) amp = 1.55;
      if (el.classList.contains("is-active")) amp = 1.75;

      amp *= MOTION;

      const dx = Math.sin(t * 0.85 + seed) * amp;
      const dy = Math.cos(t * 0.75 + seed * 0.72) * amp;

      el.style.setProperty("--driftX", `${dx.toFixed(2)}px`);
      el.style.setProperty("--driftY", `${dy.toFixed(2)}px`);
    }

    updateCardDepth();
    raf = requestAnimationFrame(tick);
  };

  const ensureRAF = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  ensureRAF();
  window.addEventListener("scroll", ensureRAF, { passive: true });
})();