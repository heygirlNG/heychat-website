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
});
