(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

  // ====================================
  // Projects (dock hover + modal)
  // ====================================
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Edit these whenever you want:
  // - title/meta/desc/bullets control the modal
  // - link controls the "View" button
  const PROJECTS = {
    slackbot: {
      title: "Slack Python Q&A Bot",
      meta: "Python · Flask · Slack API · Celery · RabbitMQ · PostgreSQL",
      desc:
        "An intelligent Slack bot that answers Python-related questions with an async backend for responsiveness.",
      bullets: [
        "Decoupled architecture: Slack webhook → Flask → RabbitMQ queue → Celery worker → Slack response.",
        "Logs requests/answers and usage stats to PostgreSQL via SQLAlchemy.",
        "Containerized local setup using Docker Compose.",
      ],
      link: "https://github.com/AII-projects/slackbot",
      icon: "chat",
    },
    diffusion: {
      title: "Faster Diffusion",
      meta: "Stable Diffusion · Diffusers · PyTorch · Sampler evaluation",
      desc:
        "Acceleration of Stable Diffusion inference by caching/reusing encoder features at key timesteps.",
      bullets: [
        "Implements the Faster Diffusion technique (encoder propagation) for faster sampling.",
        "Evaluates multiple samplers (e.g., DDIM / DPM-Solver variants) with speed–quality tradeoffs.",
        "Measures quality with metrics like FID/CLIP score and compares wall-clock sampling time.",
      ],
      link: "https://github.com/ghildiyalabhijeet/GenAIProject",
      icon: "spark",
    },
    sentiment: {
      title: "Tweet Sentiment Analysis",
      meta: "ALBERT · TensorFlow/Keras · NLP preprocessing",
      desc:
        "Sentiment classification on Twitter data using ALBERT fine-tuning and a clean preprocessing/training pipeline.",
      bullets: [
        "Preprocessing includes URL/mention/hashtag removal, emoji conversion, lemmatization, etc.",
        "Uses ALBERT tokenizer (albert-base-v2) with padding/truncation for model input.",
        "Includes evaluation artifacts like classification metrics, confusion matrix, and training curves.",
      ],
      link: "https://github.com/ghildiyalabhijeet/Tweet-Sentiment-Analysis",
      icon: "message",
    },
    pollution: {
      title: "Particle Pollution (Research)",
      meta: "Machine Learning · PM2.5 · Environmental analytics",
      desc:
        "ML-based analysis of atmospheric particle pollution datasets with a research-paper deliverable.",
      bullets: [
        "Analyzes PM2.5 / emissions patterns to predict environmental impact and air-quality trends.",
        "Implements an end-to-end ML workflow in a Jupyter notebook (prep → modeling → interpretation).",
        "Repository includes the research paper PDF alongside the notebook and dataset artifacts.",
      ],
      link: "https://github.com/ghildiyalabhijeet/MachineLearning_Particle_Pollution",
      icon: "globe",
    },
  };

  const dock = $("#projectDock");
  const tiles = dock ? $$(".project-tile", dock) : [];

  // Dock scaling effect (desktop only)
  if (dock && tiles.length && !reduceMotion) {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (!isCoarsePointer) {
      const MAX_RANGE = 240;
      const MAX_SCALE = 0.26;
      const MAX_LIFT = 14;

      const apply = (clientX) => {
        const dockRect = dock.getBoundingClientRect();
        const x = clientX - dockRect.left;

        tiles.forEach((tile) => {
          const r = tile.getBoundingClientRect();
          const cx = (r.left - dockRect.left) + r.width / 2;
          const d = Math.abs(cx - x);
          const p = Math.max(0, 1 - d / MAX_RANGE);
          const scale = 1 + MAX_SCALE * (p * p);
          const lift = -MAX_LIFT * (p * p);

          tile.style.setProperty("--dock-s", scale.toFixed(3));
          tile.style.setProperty("--dock-y", `${lift.toFixed(2)}px`);
        });
      };

      const reset = () => {
        tiles.forEach((tile) => {
          tile.style.setProperty("--dock-s", "1");
          tile.style.setProperty("--dock-y", "0px");
        });
      };

      dock.addEventListener(
        "pointermove",
        (e) => {
          if (e.pointerType !== "mouse") return;
          apply(e.clientX);
        },
        { passive: true }
      );

      dock.addEventListener("pointerleave", reset, { passive: true });
      reset();
    }
  }

  // Modal
  const modal = $("#projectModal");
  const modalTitle = $("#modalTitle");
  const modalMeta = $("#modalMeta");
  const modalDesc = $("#modalDesc");
  const modalBullets = $("#modalBullets");
  const modalLink = $("#modalLink");
  const modalCopy = $("#modalCopy");
  const modalIcon = $(".modal-icon");

  const icons = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>`,
    spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z"/><path d="M19 12l.9 2.9L23 16l-3.1 1.1L19 20l-.9-2.9L15 16l3.1-1.1L19 12z"/></svg>`,
    message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H7l-3 3V4z"/><path d="M8 8h8"/><path d="M8 12h6"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  };

  const openModal = (key) => {
    const p = PROJECTS[key];
    if (!p || !modal) return;

    modalTitle.textContent = p.title;
    modalMeta.textContent = p.meta;
    modalDesc.textContent = p.desc;

    modalBullets.innerHTML = "";
    p.bullets.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      modalBullets.appendChild(li);
    });

    if (modalLink) {
      modalLink.href = p.link;
      modalLink.setAttribute("aria-label", `View ${p.title}`);
    }

    if (modalIcon) {
      modalIcon.innerHTML = icons[p.icon] || icons.chat;
    }

    modal.classList.remove("hidden");

    const closeBtn = $(".modal-close", modal);
    closeBtn?.focus();
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  // Tile click
  tiles.forEach((t) => {
    const key = t.dataset.project;
    t.addEventListener("click", () => openModal(key));
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(key);
      }
    });
  });

  // Close handlers
  if (modal) {
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.close === "true") closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });
  }

  // Copy link
  if (modalCopy && modalLink) {
    modalCopy.addEventListener("click", async () => {
      const url = modalLink.href;
      try {
        await navigator.clipboard.writeText(url);
        const prev = modalCopy.textContent;
        modalCopy.textContent = "Copied";
        setTimeout(() => (modalCopy.textContent = prev), 1200);
      } catch (_) {
        const temp = document.createElement("input");
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand("copy");
          const prev = modalCopy.textContent;
          modalCopy.textContent = "Copied";
          setTimeout(() => (modalCopy.textContent = prev), 1200);
        } finally {
          document.body.removeChild(temp);
        }
      }
    });
  }
})();
