/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_MS = prefersReduce ? 0 : 4000; // auto-spotlight every 4s, pauses on hover/touch

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
      accentRGB: "250, 204, 21", // yellow
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
      accentRGB: "34, 197, 94", // green
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
      accentRGB: "59, 130, 246", // blue
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
      accentRGB: "168, 85, 247", // purple
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
    // chat
    return h(
      "svg",
      common,
      h("path", { d: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" }),
      h("path", { d: "M8 9h8" }),
      h("path", { d: "M8 13h5" })
    );
  }

  function computeDiff(i, active, n) {
    // shortest wrap-around distance
    let d = i - active;
    const half = Math.floor(n / 2);
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
  }

  function ProjectDeck({ projects }) {
    const n = projects.length;

    const [active, setActive] = useState(0);
    const [copiedId, setCopiedId] = useState(null);
    const [paused, setPaused] = useState(false);

    // auto-spotlight
    useEffect(() => {
      if (!AUTO_MS) return;
      if (paused) return;

      const t = setInterval(() => {
        setActive((a) => clampIndex(a + 1, n));
      }, AUTO_MS);

      return () => clearInterval(t);
    }, [paused, n]);

    // keyboard
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "ArrowLeft") setActive((a) => clampIndex(a - 1, n));
        if (e.key === "ArrowRight") setActive((a) => clampIndex(a + 1, n));
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [n]);

    // swipe/drag
    const drag = useRef({ down: false, x0: 0 });

    const onPointerDown = (e) => {
      drag.current.down = true;
      drag.current.x0 = e.clientX;
      setPaused(true); // pause on touch
    };

    const onPointerUp = (e) => {
      if (!drag.current.down) return;
      drag.current.down = false;

      const dx = e.clientX - drag.current.x0;
      if (Math.abs(dx) < DRAG_THRESHOLD) {
        // small tap: just resume
        setTimeout(() => setPaused(false), 400);
        return;
      }

      if (dx > 0) setActive((a) => clampIndex(a - 1, n));
      else setActive((a) => clampIndex(a + 1, n));

      setTimeout(() => setPaused(false), 650);
    };

    useEffect(() => {
      if (!copiedId) return;
      const t = setTimeout(() => setCopiedId(null), 900);
      return () => clearTimeout(t);
    }, [copiedId]);

    const goPrev = () => setActive((a) => clampIndex(a - 1, n));
    const goNext = () => setActive((a) => clampIndex(a + 1, n));

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
          "3D deck · infinite loop · auto‑spotlight every 4s · pause on hover/touch · click selects · double‑click opens"
        )
      ),

      h(
        "div",
        {
          className: "mc-stage",
          onMouseEnter: () => setPaused(true),
          onMouseLeave: () => setPaused(false),
        },

        h(
          "button",
          { type: "button", className: "mc-arrow left", "aria-label": "Previous", onClick: goPrev },
          h("span", null, "‹")
        ),
        h(
          "button",
          { type: "button", className: "mc-arrow right", "aria-label": "Next", onClick: goNext },
          h("span", null, "›")
        ),

        h(
          "div",
          {
            className: "mc-viewport",
            onPointerDown,
            onPointerUp,
            onPointerCancel: onPointerUp,
          },
          projects.map((p, i) => {
            const d = computeDiff(i, active, n);
            const abs = Math.abs(d);

            const visible = abs <= 3;

            // tuned for “mecarreira fan”
            const tx = d * 240;
            const tz = -abs * 180;
            const ty = abs * 18;
            const ry = d * -18;
            const rz = d * 1.5;

            const scale = Math.max(0.72, 1.07 - abs * 0.16);
            const opacity = visible ? Math.max(0, 1 - abs * 0.20) : 0;

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