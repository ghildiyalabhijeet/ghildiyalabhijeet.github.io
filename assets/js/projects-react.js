/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_MS = prefersReduce ? 0 : 5000; // ✅ switch every 5 seconds
  const DRAG_THRESHOLD = 42;

  const PROJECTS = [
    {
      id: "diffusion",
      title: "Faster Diffusion",
      year: "2025",
      meta: "GenAI · Diffusion · Optimization",
      desc: "Optimization experiments focused on speeding up diffusion pipelines while keeping output quality sharp.",
      tags: ["Python", "PyTorch", "Optimization"],
      url: "https://github.com/ghildiyalabhijeet/GenAIProject",
      thumb: "assets/img/projects/faster-diffusion.webp",
      accentRGB: "250, 204, 21",
      icon: "spark",
    },
    {
      id: "pollution",
      title: "Particle Pollution (Research)",
      year: "2022",
      meta: "Research · ML · PM2.5",
      desc: "ML workflow + research paper on modeling atmospheric particle pollution and emissions signals.",
      tags: ["Machine Learning", "PM2.5", "Research"],
      url: "https://github.com/ghildiyalabhjeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      thumb: "assets/img/projects/particle-pollution.webp",
      accentRGB: "34, 197, 94",
      icon: "globe",
    },
    {
      id: "assets",
      title: "Digital Assets Pipeline",
      year: "Repo",
      meta: "Analytics · ETL · Repo",
      desc: "An analytics pipeline repo structured for ingestion → transform → analysis with documentation in README.",
      tags: ["ETL", "Analytics", "Docs"],
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      thumb: "assets/img/projects/digital-assets-pipeline.webp",
      accentRGB: "59, 130, 246",
      icon: "bars",
    },
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      year: "2025",
      meta: "Python · Slack API · Automation",
      desc: "A Slack bot that delivers quick, real-time help for Python questions via a streamlined interface.",
      tags: ["Python", "Slack API", "Automation"],
      url: "https://github.com/AII-projects/slackbot",
      thumb: "assets/img/projects/slackbot.webp",
      accentRGB: "168, 85, 247",
      icon: "chat",
    },
  ];

  const clampIndex = (i, n) => ((i % n) + n) % n;

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

  function Icon({ name }) {
    const common = {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
    };

    if (name === "spark") {
      return h(
        "svg",
        common,
        h("path", { d: "M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z" }),
        h("path", { d: "M19 12l.9 2.9L23 16l-3.1 1.1L19 20l-.9-2.9L15 16l3.1-1.1L19 12z" })
      );
    }
    if (name === "globe") {
      return h(
        "svg",
        common,
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("path", { d: "M2 12h20" }),
        h("path", { d: "M12 2a15 15 0 0 1 0 20" }),
        h("path", { d: "M12 2a15 15 0 0 0 0 20" })
      );
    }
    if (name === "bars") {
      return h(
        "svg",
        common,
        h("path", { d: "M4 19h16" }),
        h("path", { d: "M7 16V9" }),
        h("path", { d: "M12 16V6" }),
        h("path", { d: "M17 16v-7" })
      );
    }
    return h(
      "svg",
      common,
      h("path", { d: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" }),
      h("path", { d: "M8 9h8" }),
      h("path", { d: "M8 13h5" })
    );
  }

  function computeDiff(i, active, n) {
    let d = i - active;
    const half = Math.floor(n / 2);
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
  }

  function ProjectDeck({ projects }) {
    const n = projects.length;

    const viewportRef = useRef(null);
    const [active, setActive] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    // ✅ paused ONLY when hovering the drawer
    const [paused, setPaused] = useState(false);

    const [layout, setLayout] = useState(() => ({
      cardW: 330,
      cardH: 560,
      shiftX: 240,
      depth: 180,
      lift: 18,
      avatar: 118,
      viewportH: 680,
    }));

    // Responsive sizing
    useEffect(() => {
      let raf = 0;

      const compute = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const w =
            viewportRef.current?.getBoundingClientRect().width ||
            window.innerWidth ||
            1000;
          const vh = window.innerHeight || 900;

          let cardW;
          if (w < 560) cardW = w * 0.84;
          else if (w < 920) cardW = w * 0.42;
          else cardW = 340;

          cardW = Math.round(Math.max(240, Math.min(340, cardW)));

          let cardH = Math.round(cardW * 1.62);
          cardH = Math.max(360, Math.min(560, cardH));
          cardH = Math.min(cardH, Math.round(vh * 0.70));

          const shiftX = Math.round(cardW * 0.72);
          const depth = Math.round(cardW * 0.55);
          const lift = Math.round(cardW * 0.05);

          const avatar = Math.round(Math.max(92, Math.min(118, cardW * 0.35)));

          const viewportH = Math.max(
            460,
            Math.min(Math.round(vh * 0.80), cardH + 120)
          );

          setLayout({ cardW, cardH, shiftX, depth, lift, avatar, viewportH });
        });
      };

      compute();
      window.addEventListener("resize", compute);
      return () => {
        window.removeEventListener("resize", compute);
        cancelAnimationFrame(raf);
      };
    }, []);

    const stageStyle = {
      "--cardW": `${layout.cardW}px`,
      "--cardH": `${layout.cardH}px`,
      "--avatarSize": `${layout.avatar}px`,
      "--viewportH": `${layout.viewportH}px`,
    };

    // ✅ auto spotlight every 5s, loops forever. pauses on hover.
    useEffect(() => {
      if (!AUTO_MS) return;
      if (paused) return;

      const t = setInterval(() => {
        setActive((a) => clampIndex(a + 1, n));
      }, AUTO_MS);

      return () => clearInterval(t);
    }, [paused, n]);

    // swipe/drag still works
    const drag = useRef({ down: false, x0: 0 });
    const onPointerDown = (e) => {
      drag.current.down = true;
      drag.current.x0 = e.clientX;
    };

    const onPointerUp = (e) => {
      if (!drag.current.down) return;
      drag.current.down = false;

      const dx = e.clientX - drag.current.x0;
      if (Math.abs(dx) < DRAG_THRESHOLD) return;

      if (dx > 0) setActive((a) => clampIndex(a - 1, n));
      else setActive((a) => clampIndex(a + 1, n));
    };

    useEffect(() => {
      if (!copiedId) return;
      const t = setTimeout(() => setCopiedId(null), 900);
      return () => clearTimeout(t);
    }, [copiedId]);

    return h(
      "div",
      { className: "mc-wrap" },
      h(
        "div",
        { className: "mc-head" },
        h("h2", null, "Projects"),
        h(
          "p",
          { className: "mono" },
          "Auto-switch every 5s · infinite loop · hover drawer to pause · click selects · double-click opens"
        )
      ),

      h(
        "div",
        {
          className: "mc-stage",
          style: stageStyle,
          onMouseEnter: () => setPaused(true),
          onMouseLeave: () => setPaused(false),
        },

        h(
          "div",
          {
            className: "mc-viewport",
            ref: viewportRef,
            onPointerDown,
            onPointerUp,
            onPointerCancel: onPointerUp,
          },
          projects.map((p, i) => {
            const d = computeDiff(i, active, n);
            const abs = Math.abs(d);
            const visible = abs <= 3;

            const tx = d * layout.shiftX;
            const tz = -abs * layout.depth;
            const ty = abs * layout.lift;
            const ry = d * -18;
            const rz = d * 1.4;

            const scale = Math.max(0.74, 1.08 - abs * 0.16);
            const opacity = visible ? Math.max(0, 1 - abs * 0.22) : 0;

            const transform =
              `translate(-50%, -50%) ` +
              `translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px) ` +
              `rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;

            const style = {
              "--accent": p.accentRGB,
              transform,
              opacity,
              zIndex: 100 - abs,
              pointerEvents: visible ? "auto" : "none",
            };

            return h(
              "article",
              {
                key: p.id,
                className: `mc-card ${i === active ? "is-active" : ""}`,
                style,
                role: "button",
                tabIndex: 0,
                "aria-label": `${p.title}. Click to select. Double-click to open.`,
                onClick: () => setActive(i),
                onDoubleClick: () => openInNewTab(p.url),
                onKeyDown: (e) => {
                  if (e.key === "Enter") openInNewTab(p.url);
                  if (e.key === " ") { e.preventDefault(); setActive(i); }
                },
              },

              h("div", { className: "mc-avatar" }, h(Icon, { name: p.icon })),

              h(
                "div",
                { className: "mc-body" },

                h(
                  "div",
                  { className: "mc-thumb", "aria-hidden": "true" },
                  p.thumb
                    ? h("img", {
                        className: "mc-thumbImg",
                        src: p.thumb,
                        alt: "",
                        loading: "lazy",
                        decoding: "async",
                        onError: (e) => {
                          e.currentTarget.style.display = "none";
                        },
                      })
                    : null,
                  h("div", { className: "mc-thumbOverlay" }),
                  h("div", { className: "mc-thumbIcon" }, h(Icon, { name: p.icon }))
                ),

                h(
                  "div",
                  { className: "mc-titleRow" },
                  h("h3", { className: "mc-title" }, p.title),
                  h("div", { className: "mc-year" }, p.year)
                ),
                h("div", { className: "mc-subline" }, p.meta),
                h("p", { className: "mc-desc" }, p.desc),

                h(
                  "div",
                  { className: "mc-tags" },
                  p.tags.map((t) => h("span", { key: `${p.id}-${t}`, className: "mc-tag" }, t))
                ),

                h(
                  "div",
                  { className: "mc-actions" },
                  h(
                    "button",
                    {
                      type: "button",
                      className: "mc-btn open",
                      onClick: (e) => {
                        e.stopPropagation();
                        openInNewTab(p.url);
                      },
                    },
                    "OPEN"
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "mc-btn copy",
                      onClick: async (e) => {
                        e.stopPropagation();
                        const ok = await copyText(p.url);
                        if (ok) setCopiedId(p.id);
                      },
                    },
                    copiedId === p.id ? "COPIED" : "COPY"
                  )
                )
              )
            );
          })
        ),

        h(
          "div",
          { className: "mc-dots", role: "tablist", "aria-label": "Project selector" },
          projects.map((p, i) =>
            h("button", {
              key: `dot-${p.id}`,
              type: "button",
              className: `mc-dot ${i === active ? "active" : ""}`,
              "aria-label": `Select ${p.title}`,
              onClick: () => setActive(i),
            })
          )
        )
      )
    );
  }

  function App() {
    const projects = useMemo(() => PROJECTS, []);
    return h(ProjectDeck, { projects });
  }

  const root = ReactDOM.createRoot ? ReactDOM.createRoot(mount) : null;
  if (root) root.render(h(App));
  else ReactDOM.render(h(App), mount);
})();