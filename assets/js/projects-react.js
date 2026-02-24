/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useState } = React;
  const h = React.createElement;

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const prefersReduce = mm ? mm.matches : false;
  const AUTO_MS = prefersReduce ? 0 : 4000; // switches every 4s

  // Optional: add screenshots later (assets/img/projects/...) by setting "thumb"
  const PROJECTS = [
    {
      id: "diffusion",
      title: "Faster Diffusion",
      year: "2025",
      meta: "GenAI · Diffusion · Optimization",
      tags: ["PyTorch", "Speed"],
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
      tags: ["Research", "ML"],
      url: "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      thumb: "",
      accentRGB: "34, 197, 94",
      icon: "globe",
    },
    {
      id: "assets",
      title: "Digital Assets Pipeline",
      year: "Repo",
      meta: "Analytics · ETL",
      tags: ["ETL", "Analytics"],
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      thumb: "",
      accentRGB: "72, 155, 255",
      icon: "bars",
    },
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      year: "2025",
      meta: "Python · Slack API",
      tags: ["Slack", "Automation"],
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
    const [paused, setPaused] = useState(false);

    const go = (delta) => {
      setActive((i) => clampIndex(i + delta, n));
      // User navigation = stop auto
      setPaused(true);
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

    const onCardClick = (idx) => {
      setActive(idx);
      setPaused(true); // pauses on click
    };

    const onCardDoubleClick = (idx) => {
      openInNewTab((projects[idx] && projects[idx].url));
    };

    const onKeyDown = (e) => {
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
        openInNewTab((projects[active] && projects[active].url));
      }
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };

    const trackStyle = {
      transform: `translate3d(${-active * 100}%, 0, 0)`,
    };

    const autoBtnLabel = paused ? "Resume auto switch" : "Pause auto switch";

    return h(
      "div",
      { className: "pc-wrap", onKeyDown, tabIndex: 0, role: "region", "aria-label": "Projects slideshow" },

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
              { type: "button", className: "pc-ctrl", onClick: () => go(-1), "aria-label": "Previous project" },
              "Prev"
            ),
            h(
              "button",
              { type: "button", className: "pc-ctrl", onClick: () => go(1), "aria-label": "Next project" },
              "Next"
            ),
            h(
              "button",
              {
                type: "button",
                className: `pc-ctrl ${paused ? "is-on" : ""}`,
                onClick: () => setPaused((p) => !p),
                "aria-label": autoBtnLabel,
                title: autoBtnLabel,
              },
              paused ? "▶" : "⏸"
            )
          )
        ),
        h("p", { className: "pc-hint mono" }, "Auto 4s · click pauses · double‑click opens")
      ),

      h(
        "div",
        { className: "pc-stage" },
        h(
          "div",
          { className: "pc-viewport" },
          h(
            "div",
            { className: "pc-track", style: trackStyle },
            projects.map((p, idx) => {
              const isActive = idx === active;
              const style = { "--accent": p.accentRGB || "72, 155, 255" };

              return h(
                "div",
                { key: p.id, className: "pc-slide" },
                h(
                  "button",
                  {
                    type: "button",
                    className: `pc-card ${isActive ? "is-active" : ""}`,
                    style,
                    onClick: () => onCardClick(idx),
                    onDoubleClick: () => onCardDoubleClick(idx),
                    "aria-label": `${p.title}. Click to pause. Double click to open.`,
                    title: "Click to pause · Double‑click to open",
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
                      (p.tags || []).slice(0, 2).map((t) => h("span", { key: t, className: "pc-tag mono" }, t))
                    )
                  )
                )
              );
            })
          )
        )
      ),

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
              setPaused(true);
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