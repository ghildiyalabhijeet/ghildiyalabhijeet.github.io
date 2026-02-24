/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  const mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const prefersReduce = mm ? mm.matches : false;

  const AUTO_MS = prefersReduce ? 0 : 4000;
  const TICK_MS = 70; // progress update interval (cheap + smooth enough)

  const TECH = {
    Python: { abbr: "Py", rgb: "55, 118, 171" },
    SQL: { abbr: "SQL", rgb: "59, 130, 246" },
    PyTorch: { abbr: "PT", rgb: "238, 83, 47" },
    "scikit-learn": { abbr: "SK", rgb: "249, 115, 22" },
    Slack: { abbr: "Sl", rgb: "82, 168, 64" },
    "Slack API": { abbr: "Sl", rgb: "82, 168, 64" },
    TensorFlow: { abbr: "TF", rgb: "255, 125, 0" },
    "Power BI": { abbr: "BI", rgb: "250, 204, 21" },
  };

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

  const clampIndex = (i, n) => ((i % n) + n) % n;
  const openInNewTab = (url) => url && window.open(url, "_blank", "noopener,noreferrer");

  function ProjectsH2Icon() {
    return h(
      "span",
      { className: "pc-h2Icon", "aria-hidden": "true" },
      h(
        "svg",
        { viewBox: "0 0 24 24" },
        h("path", { d: "M4 5h6v6H4z" }),
        h("path", { d: "M14 5h6v6h-6z" }),
        h("path", { d: "M4 13h6v6H4z" }),
        h("path", { d: "M14 13h6v6h-6z" })
      )
    );
  }

  function OpenIcon() {
    return h(
      "svg",
      { viewBox: "0 0 24 24", "aria-hidden": "true" },
      h("path", { d: "M14 3h7v7" }),
      h("path", { d: "M10 14L21 3" }),
      h("path", { d: "M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" })
    );
  }

  function TechIcon({ name, fallbackRGB }) {
    const meta = TECH[name] || { abbr: name.slice(0, 2).toUpperCase(), rgb: fallbackRGB };
    const style = { "--t": meta.rgb || fallbackRGB };
    return h(
      "span",
      {
        className: "pc-techIcon mono",
        style,
        title: name,
        "aria-label": name,
        role: "img",
      },
      meta.abbr
    );
  }

  function ProjectCarousel({ projects }) {
    const n = projects.length;

    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const startRef = useRef(performance.now());

    const resetProgress = () => {
      startRef.current = performance.now();
      setProgress(0);
    };

    const go = (delta) => {
      setActive((i) => clampIndex(i + delta, n));
      setPaused(true);
    };

    useEffect(() => resetProgress(), [active]);

    useEffect(() => {
      if (!AUTO_MS) return;
      if (paused) return;

      const id = window.setInterval(() => {
        const now = performance.now();
        const p = (now - startRef.current) / AUTO_MS;

        if (p >= 1) {
          setActive((i) => clampIndex(i + 1, n));
        } else {
          setProgress(p);
        }
      }, TICK_MS);

      return () => window.clearInterval(id);
    }, [paused, n, active]);

    const onCardClick = (idx) => {
      setActive(idx);
      setPaused(true);
    };

    const onCardDoubleClick = (idx) => openInNewTab(projects[idx] && projects[idx].url);

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "Enter") { e.preventDefault(); openInNewTab(projects[active] && projects[active].url); }
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };

    const trackStyle = { transform: `translate3d(${-active * 100}%, 0, 0)` };
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
          h("h2", null, h(ProjectsH2Icon), "Projects"),
          h(
            "div",
            { className: "pc-controls" },
            h("button", { type: "button", className: "pc-ctrl", onClick: () => go(-1), "aria-label": "Previous project" }, "Prev"),
            h("button", { type: "button", className: "pc-ctrl", onClick: () => go(1), "aria-label": "Next project" }, "Next"),
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
        h("p", { className: "pc-hint mono" }, "Auto 4s · click pauses · double‑click opens repo")
      ),

      h(
        "div",
        { className: "pc-stage" },

        h(
          "div",
          { className: "pc-progress", "aria-hidden": "true" },
          projects.map((p, idx) => {
            const done = idx < active;
            const fill = done ? 100 : idx === active ? Math.round(progress * 100) : 0;
            return h("div", { key: p.id, className: "pc-seg" }, h("div", { className: "pc-fill", style: { width: `${fill}%` } }));
          })
        ),

        h(
          "div",
          { className: "pc-viewport" },
          h(
            "div",
            { className: "pc-track", style: trackStyle },
            projects.map((p, idx) => {
              const isActive = idx === active;
              const style = { "--accent": p.accentRGB || "72, 155, 255" };
              const stack = Array.isArray(p.stack) ? p.stack.slice(0, 6) : [];

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
                          className: "pc-img",
                          src: p.thumb,
                          alt: `${p.title} thumbnail`,
                          loading: "lazy",
                          decoding: "async",
                          onError: (e) => { e.currentTarget.style.display = "none"; },
                        })
                      : null,

                    h("div", { className: "pc-mediaOverlay" }),

                    h("div", { className: "pc-openHint mono", "aria-hidden": "true" }, h(OpenIcon), "Open repo"),

                    h(
                      "div",
                      { className: "pc-bottomBar" },
                      h(
                        "div",
                        { className: "pc-bottomTop" },
                        h("div", { className: "pc-title" }, p.title),
                        h("div", { className: "pc-year mono" }, p.year)
                      ),
                      h(
                        "div",
                        { className: "pc-techRow" },
                        stack.map((t) => h(TechIcon, { key: t, name: t, fallbackRGB: p.accentRGB }))
                      )
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
            onClick: () => { setActive(idx); setPaused(true); },
            "aria-label": `Go to ${p.title}`,
            role: "tab",
            "aria-selected": idx === active,
          })
        )
      ),

      h(
        "div",
        { className: "pc-film", role: "list", "aria-label": "Project thumbnails" },
        projects.map((p, idx) => {
          const isActive = idx === active;
          const style = { "--accent": p.accentRGB || "72, 155, 255" };

          return h(
            "button",
            {
              key: p.id,
              type: "button",
              className: `pc-thumb ${isActive ? "is-active" : ""}`,
              style,
              role: "listitem",
              onClick: () => { setActive(idx); setPaused(true); },
              onDoubleClick: () => openInNewTab(p.url),
              "aria-label": `${p.title} thumbnail`,
              title: `${p.title} — click to select · double‑click to open`,
            },
            p.thumb
              ? h("img", {
                  className: "pc-thumbImg",
                  src: p.thumb,
                  alt: "",
                  loading: "lazy",
                  decoding: "async",
                  onError: (e) => { e.currentTarget.style.display = "none"; },
                })
              : null,
            h("div", { className: "pc-thumbOverlay" })
          );
        })
      )
    );
  }

  function App() {
    const projects = useMemo(() => PROJECTS, []);
    return h(ProjectCarousel, { projects });
  }

  ReactDOM.createRoot(mount).render(h(App));
})();