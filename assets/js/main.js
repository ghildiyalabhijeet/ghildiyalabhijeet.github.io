(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const prefersReduce = mm ? mm.matches : false;
  // We still render ambience even if the OS requests reduced motion,
  // but we slow everything down a lot.
  const MOTION = prefersReduce ? 0.55 : 1;

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
  // Focus mode: glow cards when they enter viewport (scroll focus)
  // ==============================
  const focusCards = $$(".focus-card");
  if (focusCards.length) {
    const focusIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-focus", e.isIntersecting);
        });
      },
      {
        threshold: [0.25, 0.45, 0.6],
        rootMargin: "-10% 0px -25% 0px",
      }
    );

    focusCards.forEach((el) => focusIO.observe(el));
  }

  // ==============================
  // Pane focus: hover one pane => dim others
  // ==============================
  if (focusCards.length) {
    const body = document.body;

    const clearHover = () => {
      focusCards.forEach((c) => c.classList.remove("is-hover"));
      body.classList.remove("pane-focus");
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
    });

    window.addEventListener("blur", clearHover);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") clearHover();
    });
  }

  // ==============================
  // Copy email
  // ==============================
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

  // ==============================
  // Cursor ambience (glowy orb follows pointer)
  // ==============================
  {
    const root = document.documentElement;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.45;
    let currentX = targetX;
    let currentY = targetY;

    let raf = 0;

    const tick = () => {
      raf = 0;
      // Smooth follow (ease)
      const k = 0.12 * MOTION;
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      root.style.setProperty("--mx", `${currentX.toFixed(1)}px`);
      root.style.setProperty("--my", `${currentY.toFixed(1)}px`);

      // Continue until close enough
      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);
      if (dx > 0.5 || dy > 0.5) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    // Seed with initial position
    root.style.setProperty("--mx", `${currentX.toFixed(1)}px`);
    root.style.setProperty("--my", `${currentY.toFixed(1)}px`);
  }

  // ==============================
  // Floating blue orb (random slow path)
  // ==============================
  {
    const root = document.documentElement;

    const rand = (min, max) => min + Math.random() * (max - min);

    let w = window.innerWidth;
    let h = window.innerHeight;

    // Start somewhere slightly off-screen for the "partial orb" look
    let x = rand(-0.15 * w, 1.15 * w);
    let y = rand(-0.15 * h, 1.15 * h);
    let tx = rand(-0.15 * w, 1.15 * w);
    let ty = rand(-0.15 * h, 1.15 * h);

    // Very slow speed (px/sec)
    const speed = 14 * MOTION;

    const pickTarget = () => {
      tx = rand(-0.18 * w, 1.18 * w);
      ty = rand(-0.18 * h, 1.18 * h);
    };

    // Seed CSS vars
    root.style.setProperty("--ox", `${x.toFixed(1)}px`);
    root.style.setProperty("--oy", `${y.toFixed(1)}px`);

    let last = performance.now();

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp to avoid jumps
      last = now;

      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;

      // When close, pick a new waypoint
      if (dist < 18) pickTarget();

      // Move towards target
      const stepDist = speed * dt;
      const t = Math.min(1, stepDist / dist);
      x += dx * t;
      y += dy * t;

      // Slight drift to avoid perfectly straight lines (very subtle)
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
        // keep current x/y, just pick a new target inside the new bounds
        pickTarget();
      },
      { passive: true }
    );
  }

  // ==============================
  // Subtle falling snowflakes (background, non-intrusive)
  // ==============================
  {
    const canvas = document.getElementById("bgSnow");
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");

      let w = 0;
      let h = 0;
      let dpr = Math.min(2, window.devicePixelRatio || 1);

      const rand = (min, max) => min + Math.random() * (max - min);

      const flakes = [];
      const makeFlake = (spawnY = true) => {
        const r = rand(0.6, 2.0);
        return {
          x: rand(0, w),
          y: spawnY ? rand(0, h) : rand(-h, 0),
          r,
          a: rand(0.04, 0.14),
          vy: (rand(8, 18) + r * 6) * MOTION, // fall speed
          vx: rand(-4, 4) * MOTION, // horizontal drift
          wobble: rand(3, 14),
          phase: rand(0, Math.PI * 2),
        };
      };

      const resize = () => {
        w = Math.max(1, window.innerWidth);
        h = Math.max(1, window.innerHeight);
        dpr = Math.min(2, window.devicePixelRatio || 1);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Keep count proportional but capped
        const targetCount = Math.max(48, Math.min(110, Math.floor((w * h) / 22000)));
        while (flakes.length < targetCount) flakes.push(makeFlake(true));
        while (flakes.length > targetCount) flakes.pop();
      };

      const resetFlake = (f) => {
        f.x = rand(0, w);
        f.y = rand(-30, -h * 0.2);
        f.r = rand(0.6, 2.0);
        f.a = rand(0.04, 0.14);
        f.vy = (rand(8, 18) + f.r * 6) * MOTION;
        f.vx = rand(-4, 4) * MOTION;
        f.wobble = rand(3, 14);
        f.phase = rand(0, Math.PI * 2);
      };

      resize();
      window.addEventListener("resize", resize, { passive: true });

      let last = performance.now();

      const draw = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];

          // Update
          f.y += f.vy * dt;
          f.x += f.vx * dt + Math.sin((now / 1000) + f.phase) * (f.wobble * 0.08);

          // Wrap
          if (f.y > h + 16) resetFlake(f);
          if (f.x < -20) f.x = w + 20;
          if (f.x > w + 20) f.x = -20;

          // Draw
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${f.a})`;
          ctx.fill();
        }

        requestAnimationFrame(draw);
      };

      requestAnimationFrame(draw);
    }
  }
})();