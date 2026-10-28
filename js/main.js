document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.style.display === "block";
      mobileMenu.style.display = isOpen ? "none" : "block";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (button) {
      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        faqItems.forEach((faq) => faq.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    }
  });

  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = {
        name: form.querySelector("#name"),
        email: form.querySelector("#email"),
        subject: form.querySelector("#subject"),
        message: form.querySelector("#message")
      };

      let isValid = true;

      Object.entries(fields).forEach(([key, field]) => {
        const errorEl = document.querySelector(`[data-error-for="${key}"]`);
        const value = field.value.trim();

        if (!value) {
          isValid = false;
          if (errorEl) errorEl.textContent = "This field is required.";
          field.setAttribute("aria-invalid", "true");
        } else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          if (errorEl) errorEl.textContent = "Please enter a valid email address.";
          field.setAttribute("aria-invalid", "true");
        } else {
          if (errorEl) errorEl.textContent = "";
          field.setAttribute("aria-invalid", "false");
        }
      });

      if (!isValid) {
        if (formStatus) {
          formStatus.textContent = "Please correct the highlighted fields and try again.";
          formStatus.className = "form-status error";
        }
        return;
      }

      if (formStatus) {
        formStatus.textContent = "This is a front-end demo. Connect a backend or form service to receive messages.";
        formStatus.className = "form-status success";
      }

      form.reset();
    });
  }

  const blogSearch = document.getElementById("blog-search");
  const cards = document.querySelectorAll(".blog-card");
  const tags = document.querySelectorAll(".tag");
  const loadMoreButton = document.getElementById("load-more");

  const filterBlog = (searchTerm = "", filter = "all") => {
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const category = card.dataset.category || "";
      const matchesSearch = text.includes(searchTerm);
      const matchesFilter = filter === "all" || category === filter;
      const isVisible = matchesSearch && matchesFilter;
      card.style.display = isVisible ? "block" : "none";
    });
  };

  if (blogSearch) {
    blogSearch.addEventListener("input", (event) => {
      const searchTerm = event.target.value.trim().toLowerCase();
      const activeFilter = document.querySelector(".tag.active")?.dataset.filter || "all";
      filterBlog(searchTerm, activeFilter);
    });
  }

  tags.forEach((tag) => {
    tag.addEventListener("click", () => {
      tags.forEach((item) => item.classList.remove("active"));
      tag.classList.add("active");
      const searchTerm = blogSearch ? blogSearch.value.trim().toLowerCase() : "";
      const selectedFilter = tag.dataset.filter || "all";
      filterBlog(searchTerm, selectedFilter);
    });
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
      const hiddenCards = [...cards].filter((card) => card.style.display === "none");
      const firstHidden = hiddenCards[0];
      if (firstHidden) {
        firstHidden.style.display = "block";
      } else {
        loadMoreButton.textContent = "No more articles";
        loadMoreButton.disabled = true;
      }
    });
  }

  const initNaijaRunner = () => {
    const stage = document.getElementById("gameStage");
    if (!stage) return;

    const scoreEl = document.getElementById("score");
    const bestEl = document.getElementById("best");
    const levelEl = document.getElementById("level");
    const runMessage = document.getElementById("runMessage");
    const overlay = document.getElementById("gameOverlay");
    const overlayTitle = overlay?.querySelector("h3");
    const overlayText = overlay?.querySelector("p");
    const startButton = document.getElementById("startGameBtn");
    const playNowButton = document.getElementById("playNowBtn");
    const player = document.getElementById("player");
    const buttons = [...document.querySelectorAll("[data-action]")];
    const lanePositions = [15, 50, 85];

    const obstacleTemplates = [
      { name: "police", label: "🚓", className: "police", value: 22 },
      { name: "efcc", label: "🚚", className: "efcc", value: 28 },
      { name: "lastma", label: "🚨", className: "lastma", value: 25 },
      { name: "barrier", label: "🚧", className: "barrier", value: 18 }
    ];

    const pickupTemplates = [
      { name: "gala", label: "🥯", className: "gala", value: 18 },
      { name: "suya", label: "🍢", className: "suya", value: 26 },
      { name: "water", label: "💧", className: "water", value: 12 },
      { name: "zobo", label: "🧃", className: "zobo", value: 20 },
      { name: "plantain", label: "🍌", className: "plantain", value: 22 },
      { name: "data", label: "📶", className: "data", value: 30 }
    ];

    const state = {
      running: false,
      animationId: null,
      score: 0,
      best: Number(localStorage.getItem("naijaRunBest") || 0),
      level: 1,
      lane: 1,
      playerY: 0,
      jumpVelocity: 0,
      isSliding: false,
      slideTimer: 0,
      spawnTimer: 0,
      pickupTimer: 0,
      lastFrame: 0,
      entities: []
    };

    const setMessage = (message) => {
      if (runMessage) {
        runMessage.textContent = message;
      }
    };

    const updateHud = () => {
      if (scoreEl) scoreEl.textContent = Math.floor(state.score);
      if (bestEl) bestEl.textContent = state.best;
      if (levelEl) levelEl.textContent = state.level;
    };

    const removeEntity = (entity) => {
      if (entity?.el) {
        entity.el.remove();
      }
      state.entities = state.entities.filter((item) => item !== entity);
    };

    const renderPlayer = () => {
      if (!player) return;
      const laneX = lanePositions[state.lane] || 50;
      const bottom = 18 + state.playerY;
      player.style.left = `${laneX}%`;
      player.style.bottom = `${bottom}px`;
      player.classList.toggle("jumping", state.playerY > 6);
      player.classList.toggle("sliding", state.isSliding);
    };

    const spawnObstacle = () => {
      const template = obstacleTemplates[Math.floor(Math.random() * obstacleTemplates.length)];
      const lane = Math.floor(Math.random() * 3);
      const el = document.createElement("div");
      el.className = `obstacle ${template.className}`;
      el.textContent = template.label;
      el.setAttribute("aria-label", template.name);
      stage.appendChild(el);

      state.entities.push({
        type: "obstacle",
        lane,
        x: 112,
        value: template.value,
        el
      });
    };

    const spawnPickup = () => {
      const template = pickupTemplates[Math.floor(Math.random() * pickupTemplates.length)];
      const lane = Math.floor(Math.random() * 3);
      const el = document.createElement("div");
      el.className = `collectible ${template.className}`;
      el.textContent = template.label;
      el.setAttribute("aria-label", template.name);
      stage.appendChild(el);

      state.entities.push({
        type: "pickup",
        lane,
        x: 112,
        value: template.value,
        el
      });
    };

    const startGame = () => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }

      state.running = true;
      state.score = 0;
      state.level = 1;
      state.lane = 1;
      state.playerY = 0;
      state.jumpVelocity = 0;
      state.isSliding = false;
      state.slideTimer = 0;
      state.spawnTimer = 0.8;
      state.pickupTimer = 1.4;
      state.lastFrame = 0;
      state.entities.forEach((entity) => entity.el.remove());
      state.entities = [];

      setMessage("No gree dem!");
      if (overlay) {
        overlay.classList.remove("show");
      }

      updateHud();
      renderPlayer();
      state.animationId = requestAnimationFrame(gameLoop);
    };

    const endGame = () => {
      state.running = false;
      state.best = Math.max(state.best, Math.floor(state.score));
      localStorage.setItem("naijaRunBest", String(state.best));
      updateHud();
      setMessage("Dem catch you!");

      if (overlay) {
        overlay.classList.add("show");
      }
      if (overlayTitle) {
        overlayTitle.textContent = "Dem catch you o!";
      }
      if (overlayText) {
        overlayText.textContent = `You score ${Math.floor(state.score)}. Try again and no fall hand.`;
      }
      if (startButton) {
        startButton.textContent = "Run again";
      }
    };

    const handleAction = (action) => {
      if (!state.running) return;

      if (action === "left") {
        state.lane = Math.max(0, state.lane - 1);
      }
      if (action === "right") {
        state.lane = Math.min(2, state.lane + 1);
      }
      if (action === "jump" && state.playerY <= 8) {
        state.jumpVelocity = 12.5;
      }
      if (action === "slide" && state.playerY <= 15) {
        state.isSliding = true;
        state.slideTimer = 0.7;
      }

      renderPlayer();
    };

    const gameLoop = (timestamp) => {
      if (!state.running) return;

      if (!state.lastFrame) {
        state.lastFrame = timestamp;
      }

      const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.033);
      state.lastFrame = timestamp;

      state.score += delta * 24;
      state.level = 1 + Math.floor(state.score / 180);
      updateHud();

      state.spawnTimer -= delta;
      state.pickupTimer -= delta;

      if (state.spawnTimer <= 0) {
        spawnObstacle();
        state.spawnTimer = Math.max(0.75, 1.45 - state.level * 0.08) + Math.random() * 0.5;
      }

      if (state.pickupTimer <= 0) {
        spawnPickup();
        state.pickupTimer = 1.8 + Math.random() * 1.8;
      }

      if (state.jumpVelocity || state.playerY > 0) {
        state.playerY += state.jumpVelocity * delta * 60;
        state.jumpVelocity -= 0.92 * delta * 60;
        if (state.playerY < 0) {
          state.playerY = 0;
          state.jumpVelocity = 0;
        }
      }

      if (state.isSliding) {
        state.slideTimer -= delta;
        if (state.slideTimer <= 0) {
          state.isSliding = false;
        }
      }

      renderPlayer();

      const playerRect = {
        lane: state.lane,
        x: lanePositions[state.lane],
        y: state.playerY,
        isSliding: state.isSliding
      };

      state.entities.forEach((entity) => {
        entity.x -= delta * (42 + state.level * 4.5);
        const left = Math.max(-18, entity.x);
        entity.el.style.left = `${left}%`;

        if (entity.type === "pickup") {
          entity.el.style.bottom = "90px";
        } else {
          entity.el.style.bottom = "18px";
        }

        const sameLane = entity.lane === playerRect.lane;
        const closeX = left > 8 && left < 30;

        if (sameLane && closeX) {
          if (entity.type === "pickup") {
            state.score += entity.value;
            const messages = [
              "Chop am!",
              "No yawa!",
              "Street money!",
              "That one sweet!",
              "Collect correct!"
            ];
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
            removeEntity(entity);
          } else if (playerRect.y < 55) {
            endGame();
          }
        }

        if (left < -20) {
          removeEntity(entity);
        }
      });

      if (state.running) {
        state.animationId = requestAnimationFrame(gameLoop);
      }
    };

    const resetForStart = () => {
      if (overlayTitle) overlayTitle.textContent = "No gree for dem!";
      if (overlayText) {
        overlayText.textContent = "Dodge police sirens, EFCC pressure, and LASTMA wahala. Collect Gala, suya, pure water, and zobo to keep your score rising.";
      }
      if (startButton) {
        startButton.textContent = "Start race";
      }
    };

    updateHud();
    renderPlayer();
    resetForStart();

    if (startButton) {
      startButton.addEventListener("click", startGame);
    }

    if (playNowButton) {
      playNowButton.addEventListener("click", startGame);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        if (action) handleAction(action);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        handleAction("left");
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        handleAction("right");
      }
      if (event.key === "ArrowUp" || event.key === " " || event.key.toLowerCase() === "w") {
        handleAction("jump");
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        handleAction("slide");
      }
    });
  };

  initNaijaRunner();
});
