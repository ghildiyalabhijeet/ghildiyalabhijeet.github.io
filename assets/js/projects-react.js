/* global React, ReactDOM */
(() => {
  const mount = document.getElementById("projectsReactRoot");
  if (!mount || !window.React || !window.ReactDOM) return;

  const { useMemo, useState, useEffect } = React;
  const h = React.createElement;

  // ---- Project data (titles + skills aligned with your resume) ----
  const PROJECTS = [
    {
      id: "genai",
      title: "Faster Diffusion",
      meta: "GenAI · Optimization",
      skills: ["Python", "PyTorch", "Optimization"],
      url: "https://github.com/ghildiyalabhijeet/GenAIProject",
      // GitHub OpenGraph thumbnail
      thumb: "https://opengraph.githubassets.com/1/ghildiyalabhijeet/GenAIProject",
      accent: "59 130 246",
      icon: "spark",
    },
    {
      id: "pollution",
      title: "Particle Pollution",
      meta: "Research · PM2.5",
      skills: ["Python", "ML", "Data Analysis"],
      url: "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution/blob/main/Research_Paper_Particle_Pollution.pdf",
      thumb: "https://opengraph.githubassets.com/1/ghildiyalabhijeet/MachineLearning_Particle_Pollution",
      accent: "16 185 129",
      icon: "globe",
    },
    {
      id: "pipeline",
      title: "Digital Assets Pipeline",
      meta: "Analytics · ETL",
      skills: ["ETL", "Analytics", "Docs"],
      url: "https://github.com/AII-projects/DigitalAssetsAnalyticsPipeline",
      thumb: "https://opengraph.githubassets.com/1/AII-projects/DigitalAssetsAnalyticsPipeline",
      accent: "234 179 8",
      icon: "columns",
    },
    {
      id: "slackbot",
      title: "Slack Python Q&A Bot",
      meta: "Python · Slack API",
      skills: ["Python", "Slack API", "Automation"],
      url: "https://github.com/AII-projects/slackbot",
      thumb: "https://opengraph.githubassets.com/1/AII-projects/slackbot",
      accent: "236 72 153",
      icon: "chat",
    },
  ];

  // ---- Icons (simple, clean, matches your current style) ----
  const Icon = ({ name }) => {
    const base = { viewBox: "0 0 24 24", "aria-hidden": "true" };

    if (name === "spark") {
      return h(
        "svg",
        base,
        h("path", { d: "M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z" }),
        h("path", { d: "M19 12l.9 2.9L23 16l-3.1 1.1L19 20l-.9-2.9L15 16l3.1-1.1L19 12z" })
      );
    }

    if (name === "globe") {
      return h(
        "svg",
        base,
        h("circle", { cx: "12", cy: "12", r: "9" }),
        h("path", { d: "M3 12h18" })
      );
    }

    if (name === "columns") {
      return h(
        "svg",
        base,
        h("path", { d: "M4 6h16v4H4z" }),
        h("path", { d: "M6 10v8" }),
        h("path", { d: "M10 10v8" }),
        h("path", { d: "M14 10v8" }),
        h("path", { d: "M18 10v8" }),
        h("path", { d: "M4 18h16" })
      );
    }

    // chat
    return h(
      "svg",
      base,
      h("path", { d: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" }),
      h("path", { d: "M8 9h8" }),
      h("path", { d: "M8 13h5" })
    );
  };

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  function ProjectCard({ p, active, onSelect }) {
    const onKeyDown = (e) => {
      // Enter opens (keyboard-friendly)
      if (e.key === "Enter") {
        e.preventDefault();
        openInNewTab(p.url);
      }
      // Space selects
      if (e.key === " ") {
        e.preventDefault();
        onSelect(p.id);
      }
    };

    return h(
      "button",
      {
        type: "button",
        className: `pcard ${active ? "is-active" : ""}`,
        style: { "--accent": p.accent },
        onClick: () => onSelect(p.id),
        onDoubleClick: () => openInNewTab(p.url),
        onKeyDown,
        "aria-label": `${p.title}. Double-click to open.`,
      },
      h(
        "div",
        { className: "pthumb", "aria-hidden": "true" },
        // thumbnail image (blurred behind glass)
        h("img", { src: p.thumb, alt: "", loading: "lazy", decoding: "async" }),
        // icon badge
        h("div", { className: "pbadge" }, h("div", { className: "icon" }, h(Icon, { name: p.icon }))),
        // hover overlay (skills)
        h(
          "div",
          { className: "poverlay" },
          h(
            "div",
            { className: "pchips" },
            ...(p.skills || []).map((s) => h("span", { key: s, className: "pchip" }, s))
          ),
          h("div", { className: "phint mono" }, "Double‑click opens")
        )
      ),
      h("h3", { className: "ptitle" }, p.title),
      h("p", { className: "pmeta mono" }, p.meta)
    );
  }

  function ProjectsMarquee({ projects }) {
    const [paused, setPaused] = useState(false);
    const [activeId, setActiveId] = useState(projects?.[0]?.id || null);
    const [reduceMotion, setReduceMotion] = useState(false);

    // Respect reduced-motion preference
    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const apply = () => setReduceMotion(!!mq.matches);
      apply();

      if (mq.addEventListener) mq.addEventListener("change", apply);
      else mq.addListener(apply);

      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", apply);
        else mq.removeListener(apply);
      };
    }, []);

    // Render two identical groups => seamless -50% loop
    const groups = useMemo(() => [projects, projects], [projects]);

    // Speed: more cards => slightly longer duration so it feels smooth
    const duration = useMemo(() => {
      const n = Math.max(4, projects.length);
      // 18..28s depending on count
      return Math.min(28, 14 + n * 2);
    }, [projects.length]);

    const rootClass = `rproj ${paused ? "is-paused" : ""} ${reduceMotion ? "is-reduced" : ""}`;

    return h(
      "div",
      { className: rootClass, style: { "--projMarqueeDuration": `${duration}s` } },
      h(
        "div",
        {
          className: "pmarquee glass-lite prism-lite",
          onPointerEnter: () => setPaused(true),
          onPointerLeave: () => setPaused(false),
          // Tap to pause briefly on touch devices
          onPointerDown: () => {
            setPaused(true);
            window.clearTimeout(ProjectsMarquee._t);
            ProjectsMarquee._t = window.setTimeout(() => setPaused(false), 1400);
          },
          "aria-label": "Projects infinite gallery",
        },
        h(
          "div",
          { className: "pmarquee-track" },
          groups.map((g, i) =>
            h(
              "div",
              { className: "pgroup", key: `g-${i}`, "aria-hidden": i === 1 ? "true" : "false" },
              g.map((p) =>
                h(ProjectCard, {
                  key: `${i}-${p.id}`,
                  p,
                  active: p.id === activeId,
                  onSelect: setActiveId,
                })
              )
            )
          )
        )
      ),
      h("div", { className: "rproj-hint mono micro muted" }, "Hover to pause · Hover a card to see skills · Double‑click opens")
    );
  }

  function App() {
    return h(ProjectsMarquee, { projects: PROJECTS });
  }

  ReactDOM.createRoot(mount).render(h(App));
})();