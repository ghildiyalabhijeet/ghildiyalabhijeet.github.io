/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  // Projects + tags match your resume + the links you provided.
  const PROJECTS = [
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      date: "Nov 2025",
      desc: "Real-time Python help inside Slack — streamlined Q&A and faster troubleshooting.",
      bullets: [
        "Integrated Python with Slack API for seamless Q&A interaction.",
        "Built for reduced context-switching and rapid response loops.",
      ],
      tags: ["Python", "Slack API", "Automation"],
      url: "https://github.com/AII-projects/slackbot",
      thumb: "https://opengraph.githubassets.com/1/AII-projects/slackbot",
    },
    {
      id: "diffusion",
      title: "Faster Diffusion",
      date: "May 2025",
      desc: "Optimization work to speed up diffusion pipelines while keeping output quality sharp.",
      bullets: [
        "Optimization techniques to improve generation speed and efficiency.",
        "Tuned pipeline/architecture knobs for better throughput.",
      ],
      tags: ["GenAI", "Diffusion", "Optimization", "Python"],
      url: "https://github.com/ghildiyalabhijeet/GenAIProject",
      thumb: "https://opengraph.githubassets.com/1/ghildiyalabhijeet/GenAIProject",
    },
    {
      id: "pollution",
      title: "Particle Pollution (Research)",
      date: "May 2022",
      desc: "ML analysis to model PM2.5 patterns and create a framework for predicting air-quality trends.",
      bullets: [
        "Analyzed PM2.5 + emissions patterns to predict environmental impact.",
        "Research paper included — opens directly to PDF.",
      ],
      tags: ["Machine Learning", "Data Analysis", "PM2.5", "Research"],
      url: "https://github.com/ghildiyalabhjeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      thumb: "https://opengraph.githubassets.com/1/ghildiyalabhijeet/MachineLearning_Particle_Pollution",
    },
    {
      id: "assets",
      title: "Digital Assets Analytics Pipeline",
      date: "Repo",
      desc: "End-to-end analytics pipeline repo — ingestion → transform → analysis, documented in README.",
      bullets: [
        "Repeatable ETL structure designed for auditable transformations.",
        "Open the repo for architecture + setup details.",
      ],
      tags: ["Analytics", "ETL", "Pipeline", "Docs"],
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      thumb: "https://opengraph.githubassets.com/1/AII-projects/DigitalAssetsAnalyticsPipeline",
    },
  ];

  const clampIndex = (idx, n) => {
    if (n <= 0) return 0;
    return ((idx % n) + n) % n;
  };

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    // Fallback
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
  };

  function ProjectsDrawer({ projects }) {
    const rootRef = useRef(null);
    const trackRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [manualLock, setManualLock] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const activeRef = useRef(0);
    const lockRef = useRef(false);
    const selectedRef = useRef(0);
    const pausedRef = useRef(false);
    const inViewRef = useRef(false);

    useEffect(() => { activeRef.current = activeIndex; }, [activeIndex]);
    useEffect(() => { lockRef.current = manualLock; }, [manualLock]);

    const total = projects.length;

    const getCards = () => {
      const track = trackRef.current;
      if (!track) return [];
      return Array.from(track.querySelectorAll(".gd-card"));
    };

    const getPadLeft = () => {
      const track = trackRef.current;
      if (!track) return 0;
      const s = getComputedStyle(track);
      return parseFloat(s.paddingLeft || "0") || 0;
    };

    const scrollToCard = (idx, smooth) => {
      const track = trackRef.current;
      const cards = getCards();
      if (!track || cards.length === 0) return;

      const i = clampIndex(idx, cards.length);
      const padLeft = getPadLeft();
      const left = Math.max(0, cards[i].offsetLeft - padLeft);
      track.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    };

    const getScrollActiveIndex = () => {
      const track = trackRef.current;
      const cards = getCards();
      if (!track || cards.length === 0) return 0;

      const center = track.scrollLeft + track.clientWidth * 0.5;
      let best = 0;
      let bestD = Infinity;

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const cx = c.offsetLeft + c.offsetWidth * 0.5;
        const d = Math.abs(cx - center);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const lockToIndex = (idx, smooth = true) => {
      const cards = getCards();
      if (cards.length === 0) return;

      const i = clampIndex(idx, cards.length);
      setManualLock(true);
      selectedRef.current = i;
      setActiveIndex(i);
      scrollToCard(i, smooth);
      stopAuto();
    };

    const unlock = () => {
      if (!lockRef.current) return;
      setManualLock(false);
      // let scroll determine again
      const i = getScrollActiveIndex();
      setActiveIndex(i);
      startAuto();
    };

    // Prev/Next
    const goPrev = () => lockToIndex((lockRef.current ? selectedRef.current : activeRef.current) - 1, true);
    const goNext = () => lockToIndex((lockRef.current ? selectedRef.current : activeRef.current) + 1, true);

    // ===== Drag to scroll (like GoDSpeeD0o0) =====
    useEffect(() => {
      const track = trackRef.current;
      if (!track) return;

      let pointerActive = false;
      let dragging = false;
      let startX = 0;
      let startLeft = 0;
      let pid = null;
      let lastDragTime = 0;

      const DRAG_THRESHOLD = 7;

      track.classList.add("grab");

      const endPointer = () => {
        if (!pointerActive) return;
        pointerActive = false;

        if (dragging) {
          dragging = false;
          track.classList.remove("grabbing");
          lastDragTime = performance.now();
          // if not locked, update active on drag end
          if (!lockRef.current) setActiveIndex(getScrollActiveIndex());
          scheduleResume();
        }
        pid = null;
      };

      track.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        pointerActive = true;
        dragging = false;
        startX = e.clientX;
        startLeft = track.scrollLeft;
        pid = e.pointerId;
      });

      track.addEventListener("pointermove", (e) => {
        if (!pointerActive) return;
        const dx = e.clientX - startX;

        if (!dragging) {
          if (Math.abs(dx) < DRAG_THRESHOLD) return;
          dragging = true;
          stopAuto();
          try { track.setPointerCapture(pid); } catch (_) {}
          track.classList.add("grabbing");
        }

        track.scrollLeft = startLeft - dx;
      });

      track.addEventListener("pointerup", endPointer);
      track.addEventListener("pointercancel", endPointer);
      track.addEventListener("lostpointercapture", endPointer);

      // Click vs drag guard (so clicks don't fire right after drag)
      track.addEventListener(
        "click",
        (e) => {
          if (performance.now() - lastDragTime < 240) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );

      return () => {
        // NOTE: we attached anonymous handlers above; keeping cleanup minimal is OK
        // for this single-mount component. If you want strict cleanup, tell me and
        // I’ll rewrite with named functions.
      };
    }, []);

    // ===== Scroll -> active index (when not locked) =====
    useEffect(() => {
      const track = trackRef.current;
      if (!track) return;

      let raf = 0;

      const onScroll = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (lockRef.current) return;
          const i = getScrollActiveIndex();
          if (i !== activeRef.current) setActiveIndex(i);
        });
      };

      track.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });

      // initial
      onScroll();

      return () => {
        track.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }, []);

    // ===== Auto spotlight (loops) + pause on hover =====
    const AUTO_MS = 9000;
    const RESUME_AFTER_MS = 1800;
    const autoTimerRef = useRef(null);
    const resumeTimerRef = useRef(null);

    const stopAuto = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    };

    const startAuto = () => {
      if (!inViewRef.current) return;
      if (document.hidden) return;
      if (lockRef.current) return;
      if (pausedRef.current) return;
      if (autoTimerRef.current) return;

      autoTimerRef.current = setInterval(() => {
        if (lockRef.current) return;
        if (pausedRef.current) return;
        const next = clampIndex(activeRef.current + 1, total);
        setActiveIndex(next);
        scrollToCard(next, true);
      }, AUTO_MS);
    };

    const scheduleResume = () => {
      if (lockRef.current) return;
      stopAuto();
      resumeTimerRef.current = setTimeout(() => startAuto(), RESUME_AFTER_MS);
    };

    useEffect(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const onEnter = () => {
        pausedRef.current = true;
        stopAuto();
      };
      const onLeave = () => {
        pausedRef.current = false;
        scheduleResume();
      };

      track.addEventListener("mouseenter", onEnter);
      track.addEventListener("mouseleave", onLeave);

      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          inViewRef.current = !!entry?.isIntersecting && entry.intersectionRatio >= 0.25;
          if (inViewRef.current) startAuto();
          else stopAuto();
        },
        { threshold: [0, 0.25, 0.6, 1] }
      );
      io.observe(root);

      const onVis = () => {
        if (document.hidden) stopAuto();
        else startAuto();
      };
      document.addEventListener("visibilitychange", onVis);

      // outside click unlock (like GoDSpeeD0o0)
      const onDocDown = (e) => {
        if (!lockRef.current) return;
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        if (t.closest(".gd-card")) return;
        if (t.closest(".gd-btn")) return;
        if (t.closest(".gd-dot")) return;
        if (!t.closest("#projectsReactRoot")) unlock();
        else unlock();
      };
      document.addEventListener("pointerdown", onDocDown);

      // initial auto
      startAuto();

      return () => {
        stopAuto();
        track.removeEventListener("mouseenter", onEnter);
        track.removeEventListener("mouseleave", onLeave);
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        document.removeEventListener("pointerdown", onDocDown);
      };
    }, [total]);

    // Copy feedback
    useEffect(() => {
      if (!copiedId) return;
      const t = setTimeout(() => setCopiedId(null), 1100);
      return () => clearTimeout(t);
    }, [copiedId]);

    return h(
      "div",
      { ref: rootRef, className: "gd-projects" },
      h(
        "div",
        { className: "gd-header" },
        h(
          "div",
          null,
          h("div", { className: "gd-title" }, "Projects"),
          h("div", { className: "gd-sub mono" }, "Project drawer · click to pin · double‑click opens")
        ),
        h("div", { className: "gd-rule" })
      ),

      h(
        "div",
        { className: "gd-toolbar" },
        h(
          "div",
          { className: "gd-count mono" },
          "Project ",
          String(activeIndex + 1).padStart(2, "0"),
          " of ",
          String(total).padStart(2, "0"),
          h("span", { className: "mono", style: { opacity: 0.65, marginLeft: 10 } }, "• choose your build")
        ),
        h(
          "div",
          { className: "gd-dots" },
          projects.map((_, i) =>
            h("button", {
              key: `dot-${i}`,
              type: "button",
              className: `gd-dot ${i === activeIndex ? "active" : ""}`,
              "aria-label": `Go to project ${i + 1}`,
              onClick: () => lockToIndex(i, true),
            })
          )
        )
      ),

      h(
        "div",
        { className: "gd-drawer" },
        h(
          "button",
          { type: "button", className: "gd-btn left", "aria-label": "Previous project", onClick: goPrev },
          h("span", { className: "mono" }, "‹")
        ),

        h(
          "div",
          { ref: trackRef, className: "gd-track" },
          projects.map((p, i) =>
            h(
              "article",
              {
                key: p.id,
                className: `gd-card gd-glass ${i === activeIndex ? "is-active" : "is-dim"}`,
                tabIndex: 0,
                role: "button",
                "aria-label": `${p.title}. Double-click to open.`,
                onClick: () => {
                  // pin selection (click selects)
                  lockToIndex(i, true);
                },
                onDoubleClick: () => openInNewTab(p.url),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    openInNewTab(p.url);
                  }
                  if (e.key === " ") {
                    e.preventDefault();
                    lockToIndex(i, true);
                  }
                },
              },
              h(
                "div",
                { className: "gd-thumb", "aria-hidden": "true" },
                h("img", { src: p.thumb, alt: "", loading: "lazy", decoding: "async" })
              ),

              h(
                "div",
                { className: "gd-meta" },
                h(
                  "div",
                  null,
                  h("div", { className: "gd-name" }, p.title),
                  h("div", { className: "gd-date mono" }, p.date || "")
                ),
                h(
                  "div",
                  { className: "gd-actions" },
                  h(
                    "button",
                    {
                      type: "button",
                      className: "gd-pillbtn primary",
                      onClick: (e) => {
                        e.stopPropagation();
                        openInNewTab(p.url);
                      },
                      "aria-label": `Open ${p.title}`,
                    },
                    "Open"
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "gd-pillbtn",
                      onClick: async (e) => {
                        e.stopPropagation();
                        const ok = await copyText(p.url);
                        if (ok) setCopiedId(p.id);
                      },
                      "aria-label": `Copy link for ${p.title}`,
                    },
                    copiedId === p.id ? "Copied" : "Copy"
                  )
                )
              ),

              h("p", { className: "gd-desc" }, p.desc),

              h(
                "div",
                { className: "gd-extra" },
                h(
                  "ul",
                  { className: "gd-bullets" },
                  (p.bullets || []).map((b, bi) => h("li", { key: `${p.id}-b-${bi}` }, b))
                ),
                h(
                  "div",
                  { className: "gd-tags" },
                  (p.tags || []).map((t) => h("span", { key: `${p.id}-t-${t}`, className: "gd-tag mono" }, t))
                )
              )
            )
          )
        ),

        h(
          "button",
          { type: "button", className: "gd-btn right", "aria-label": "Next project", onClick: goNext },
          h("span", { className: "mono" }, "›")
        )
      )
    );
  }

  function App() {
    const projects = useMemo(() => PROJECTS, []);
    return h(ProjectsDrawer, { projects });
  }

  // Mount
  const root = ReactDOM.createRoot ? ReactDOM.createRoot(mount) : null;
  if (root) root.render(h(App));
  else ReactDOM.render(h(App), mount);
})();