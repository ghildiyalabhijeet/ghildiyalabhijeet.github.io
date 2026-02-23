/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const AUTO_MS = prefersReduce ? 0 : 5000; // auto-switch every 5s

  // NOTE: "thumb" is optional. If you add screenshots later, put them in assets/img/projects/
  // and set thumb to the file path.
  const PROJECTS = [
    {
      id: "diffusion",
      title: "Faster Diffusion",
      year: "2025",
      meta: "GenAI · Diffusion · Optimization",
      tags: ["PyTorch", "Speed", "GenAI"],
      url: "https://github.com/ghildiyalabhijeet/GenAIProject",
      thumb: "",
      accentRGB: "250, 204, 21",
      icon: "spark",
    },
    {
      id: "pollution",
      title: "Particle Pollution",
      year: "2022",
      meta: "Research · ML · PM2.5",
      tags: ["Research", "ML", "PM2.5"],
      url: "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      thumb: "",
      accentRGB: "34, 197, 94",
      icon: "globe",
    },
    {
      id: "assets",
      title: "Digital Assets Pipeline",
      year: "Repo",
      meta: "Analytics · ETL · Repo",
      tags: ["ETL", "Analytics", "Docs"],
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      thumb: "",
      accentRGB: "72, 155, 255",
      icon: "bars",
    },
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      year: "2025",
      meta: "Python · Slack API · Automation",
      tags: ["Slack", "Python", "Automation"],
      url: "https://github.com/AII-projects/slackbot",
      thumb: "",
      accentRGB: "167, 139, 250",
      icon: "chat",
    },
  ];

  const clampIndex = (i, n) => ((i % n) + n) % n;

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
        h("path", {
          d: "M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z",
        }),
        h("path", {
          d: "M19 12l.9 2.9L23 16l-3.1 1.1L19 20l-.9-2.9L15 16l3.1-1.1L19 12z",
        })
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
      h("path", {
        d: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z",
      }),
      h("path", { d: "M8 9h8" }),
      h("path", { d: "M8 13h5" })
    );
  }

  function ProjectCarousel({ projects }) {
    const n = projects.length;

    const [active, setActive] = useState(0);
    const [manualPaused, setManualPaused] = useState(false);
    const [hoverPaused, setHoverPaused] = useState(false);

    const paused = manualPaused || hoverPaused;

    const trackRef = useRef(null);
    const scrollRaf = useRef(0);

    const go = (delta) => {
      setActive((i) => clampIndex(i + delta, n));
      // If the user is controlling navigation, stop auto.
      setManualPaused(true);
    };

    // Auto-switch
    useEffect(() => {
      if (!AUTO_MS) return;
      if (paused) return;
      const t = setInterval(() => {
        setActive((i) => clampIndex(i + 1, n));
      }, AUTO_MS);
      return () => clearInterval(t);
    }, [paused, n]);

    // Keep the active slide centered
    useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const el = track.querySelector(`[data-idx='${active}']`);
      if (!el) return;
      try {
        el.scrollIntoView({
          behavior: prefersReduce ? "auto" : "smooth",
          inline: "center",
          block: "nearest",
        });
      } catch (_) {
        // ignore
      }
    }, [active]);

    const onTrackScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      if (scrollRaf.current) return;

      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = 0;

        const rect = track.getBoundingClientRect();
        const center = rect.left + rect.width / 2;

        const slides = Array.from(track.querySelectorAll(".pc-slide"));
        let best = 0;
        let bestDist = Infinity;

        slides.forEach((s, idx) => {
          const r = s.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.abs(c - center);
          if (d < bestDist) {
            bestDist = d;
            best = idx;
          }
        });

        if (best !== active) setActive(best);
      });
    };

    const onSlideClick = (idx) => {
      setActive(idx);
      setManualPaused(true); // single click stops
    };

    const onSlideDoubleClick = (idx) => {
      const p = projects[idx];
      openInNewTab(p?.url);
    };

    const onSlideKeyDown = (e, idx) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        openInNewTab(projects[idx]?.url);
      }
      if (e.key === " ") {
        e.preventDefault();
        setManualPaused((p) => !p);
      }
    };

    const statusText = manualPaused
      ? "Paused · double‑click opens"
      : hoverPaused
        ? "Hover pause · double‑click opens"
        : "Auto-switch 5s · click pauses · double‑click opens";

    return h(
      "div",
      { className: "pc-wrap" },

      // Header
      h(
        "div",
        { className: "pc-head" },
        h(
          "div",
          { className: "pc-titleRow" },
          h("h2", null, "Projects"),
          h(
            "div",
            { className: "pc-controls" },
            h(
              "button",
              {
                type: "button",
                className: "pc-ctrl",
                onClick: () => go(-1),
                "aria-label": "Previous project",
              },
              "Prev"
            ),
            h(
              "button",
              {
                type: "button",
                className: "pc-ctrl",
                onClick: () => go(1),
                "aria-label": "Next project",
              },
              "Next"
            ),
            h(
              "button",
              {
                type: "button",
                className: `pc-ctrl ${manualPaused ? "is-on" : ""}`,
                onClick: () => setManualPaused((p) => !p),
                "aria-label": manualPaused ? "Resume auto-switch" : "Pause auto-switch",
              },
              manualPaused ? "Play" : "Pause"
            )
          )
        ),
        h("p", { className: "pc-sub mono" }, statusText)
      ),

      // Stage
      h(
        "div",
        {
          className: "pc-stage",
          onMouseEnter: () => setHoverPaused(true),
          onMouseLeave: () => setHoverPaused(false),
        },
        h(
          "div",
          {
            className: "pc-track",
            ref: trackRef,
            onScroll: onTrackScroll,
            onPointerDown: () => setManualPaused(true),
            role: "list",
            "aria-label": "Projects slideshow",
          },
          projects.map((p, idx) => {
            const isActive = idx === active;
            const style = { "--accent": p.accentRGB || "72, 155, 255" };

            return h(
              "div",
              {
                key: p.id,
                className: `pc-slide ${isActive ? "is-active" : ""}`,
                role: "listitem",
                "data-idx": idx,
              },
              h(
                "button",
                {
                  type: "button",
                  className: `pc-card ${isActive ? "is-active" : ""}`,
                  style,
                  onClick: () => onSlideClick(idx),
                  onDoubleClick: () => onSlideDoubleClick(idx),
                  onKeyDown: (e) => onSlideKeyDown(e, idx),
                  "aria-label": `${p.title}. Click to pause. Double click to open.`,
                  title: "Click to pause · Double-click to open",
                },
                h(
                  "div",
                  { className: "pc-media" },
                  p.thumb
                    ? h("img", {
                        src: p.thumb,
                        alt: "",
                        className: "pc-img",
                        loading: "lazy",
                        onError: (e) => {
                          // If missing, just hide the broken image.
                          e.currentTarget.style.display = "none";
                        },
                      })
                    : null,
                  h("div", { className: "pc-overlay" }),
                  h("div", { className: "pc-icon" }, h(Icon, { name: p.icon }))
                ),
                h(
                  "div",
                  { className: "pc-info" },
                  h(
                    "div",
                    { className: "pc-top" },
                    h("div", { className: "pc-title" }, p.title),
                    h("div", { className: "pc-year mono" }, p.year)
                  ),
                  h("div", { className: "pc-meta mono" }, p.meta),
                  h(
                    "div",
                    { className: "pc-tags" },
                    (p.tags || []).slice(0, 3).map((t) => h("span", { key: t, className: "pc-tag mono" }, t))
                  )
                )
              )
            );
          })
        )
      ),

      // Dots
      h(
        "div",
        { className: "pc-dots", role: "tablist", "aria-label": "Select project" },
        projects.map((p, idx) =>
          h("button", {
            key: p.id,
            type: "button",
            className: `pc-dot ${idx === active ? "is-active" : ""}`,
            onClick: () => {
              setActive(idx);
              setManualPaused(true);
            },
            "aria-label": `Go to ${p.title}`,
            role: "tab",
            "aria-selected": idx === active,
          })
        )
      )
    );
  }

  function App() {
    const projects = useMemo(() => PROJECTS, []);
    return h(ProjectCarousel, { projects });
  }

  ReactDOM.createRoot(mount).render(h(App));
})();