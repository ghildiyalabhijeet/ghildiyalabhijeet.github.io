(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

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
  // Focus mode: glow cards when they enter viewport
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
        // Highlight when the card is meaningfully on screen
        threshold: [0.25, 0.45, 0.6],
        rootMargin: "-10% 0px -25% 0px",
      }
    );

    focusCards.forEach((el) => focusIO.observe(el));
  }

  // ==============================
  // Copy email
  // ==============================
  const copyBtn = $("#copyEmailBtn");
  const EMAIL = "aghildiy@asu.edu";

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
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
  if (!prefersReduce) {
    const root = document.documentElement;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.45;
    let currentX = targetX;
    let currentY = targetY;

    let raf = 0;

    const tick = () => {
      raf = 0;
      // Smooth follow (ease)
      const k = 0.12;
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
})();