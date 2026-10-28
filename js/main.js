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
      { name: "police", label: "🚓", cls: "police", value: 20 },
      { name: "efcc", label: "🚚", cls: "efcc", value: 28 },
      { name: "lastma", label: "🚨", cls: "lastma", value: 24 },
      { name: "barrier", label: "🚧", cls: "barrier", value: 18 }
    ];

    const pickupTemplates = [
      { name: "gala", label: "🥯", cls: "gala", value: 18 },
      { name: "suya", label: "🍢", cls: "suya", value: 25 },
      { name: "water", label: "💧", cls: "water", value: 12 },
      { name: "zobo", label: "🧃", cls: "zobo", value: 20 },
      { name: "plantain", label: "🍌", cls: "plantain", value: 22 },
      { name: "data", label: "📶", cls: "data", value: 30 }
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
      spawnTimer: 0.8,
      pickupTimer: 1.5,
      lastFrame: 0,
      entities: []
    };

    const setMessage = (message) => {
      if (runMessage) runMessage.textContent = message;
    };

    const updateHud = () => {
      if (scoreEl) scoreEl.textContent = Math.floor(state.score);
      if (bestEl) bestEl.textContent = state.best;
      if (levelEl) levelEl.textContent = state.level;
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

    const removeEntity = (entity) => {
      if (!entity) return;
      entity.el.remove();
      state.entities = state.entities.filter((item) => item !== entity);
    };

    const spawnObstacle = () => {
      const template = obstacleTemplates[Math.floor(Math.random() * obstacleTemplates.length)];
      const lane = Math.floor(Math.random() * 3);
      const el = document.createElement("div");
      el.className = `obstacle ${template.cls}`;
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
      el.className = `collectible ${template.cls}`;
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

    const clearEntities = () => {
      state.entities.forEach((entity) => entity.el.remove());
      state.entities = [];
    };

    const startGame = () => {
      if (state.animationId) cancelAnimationFrame(state.animationId);

      state.running = true;
      state.score = 0;
      state.level = 1;
      state.lane = 1;
      state.playerY = 0;
      state.jumpVelocity = 0;
      state.isSliding = false;
      state.slideTimer = 0;
      state.spawnTimer = 0.9;
      state.pickupTimer = 1.5;
      state.lastFrame = 0;
      clearEntities();

      setMessage("No gree dem!");
      if (overlay) overlay.classList.remove("show");
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

      if (overlay) overlay.classList.add("show");
      if (overlayTitle) overlayTitle.textContent = "Dem catch you o!";
      if (overlayText) overlayText.textContent = `You score ${Math.floor(state.score)}. Try again and no fall hand.`;
      if (startButton) startButton.textContent = "Run again";
    };

    const handleAction = (action) => {
      if (!state.running) return;

      if (action === "left") state.lane = Math.max(0, state.lane - 1);
      if (action === "right") state.lane = Math.min(2, state.lane + 1);
      if (action === "jump" && state.playerY <= 6) state.jumpVelocity = 12.5;
      if (action === "slide" && state.playerY <= 16) {
        state.isSliding = true;
        state.slideTimer = 0.7;
      }

      renderPlayer();
    };

    const gameLoop = (timestamp) => {
      if (!state.running) return;

      if (!state.lastFrame) state.lastFrame = timestamp;
      const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.033);
      state.lastFrame = timestamp;

      state.score += delta * 26;
      state.level = 1 + Math.floor(state.score / 180);
      updateHud();

      state.spawnTimer -= delta;
      state.pickupTimer -= delta;

      if (state.spawnTimer <= 0) {
        spawnObstacle();
        state.spawnTimer = Math.max(0.8, 1.45 - state.level * 0.08) + Math.random() * 0.35;
      }

      if (state.pickupTimer <= 0) {
        spawnPickup();
        state.pickupTimer = 1.9 + Math.random() * 1.4;
      }

      if (state.jumpVelocity || state.playerY > 0) {
        state.playerY += state.jumpVelocity * delta * 60;
        state.jumpVelocity -= 0.9 * delta * 60;
        if (state.playerY < 0) {
          state.playerY = 0;
          state.jumpVelocity = 0;
        }
      }

      if (state.isSliding) {
        state.slideTimer -= delta;
        if (state.slideTimer <= 0) state.isSliding = false;
      }

      renderPlayer();

      const playerRect = {
        lane: state.lane,
        y: state.playerY,
        isSliding: state.isSliding
      };

      state.entities.forEach((entity) => {
        entity.x -= delta * (40 + state.level * 4.5);
        const left = entity.x;
        entity.el.style.left = `${left}%`;
        entity.el.style.bottom = entity.type === "pickup" ? "90px" : "18px";

        const sameLane = entity.lane === playerRect.lane;
        const closeEnough = left > 7 && left < 30;

        if (sameLane && closeEnough) {
          if (entity.type === "pickup") {
            state.score += entity.value;
            const msgs = ["Chop am!", "No yawa!", "Street money!", "Sweet!", "Collect correct!"];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
            removeEntity(entity);
          } else if (playerRect.y < 52) {
            endGame();
            return;
          }
        }

        if (left < -18) removeEntity(entity);
      });

      if (state.running) {
        state.animationId = requestAnimationFrame(gameLoop);
      }
    };

    const resetOverlayCopy = () => {
      if (overlayTitle) overlayTitle.textContent = "No gree for dem!";
      if (overlayText) {
        overlayText.textContent = "Dodge police sirens, EFCC pressure, and LASTMA wahala. Collect Gala, suya, pure water, and zobo to keep your score rising.";
      }
      if (startButton) startButton.textContent = "Start race";
    };

    updateHud();
    renderPlayer();
    resetOverlayCopy();

    if (startButton) startButton.addEventListener("click", startGame);
    if (playNowButton) playNowButton.addEventListener("click", startGame);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        if (action) handleAction(action);
      });
    });

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (event.key === "ArrowLeft" || key === "a") handleAction("left");
      if (event.key === "ArrowRight" || key === "d") handleAction("right");
      if (event.key === "ArrowUp" || event.key === " " || key === "w") handleAction("jump");
      if (event.key === "ArrowDown" || key === "s") handleAction("slide");
    });
  };

  initNaijaRunner();
});
