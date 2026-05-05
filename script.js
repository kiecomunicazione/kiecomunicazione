(function () {
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var yearEl = document.getElementById("year");

  function setMenuOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Chiudi il menu di navigazione" : "Apri il menu di navigazione");
    nav.classList.toggle("is-open", open);
    nav.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("nav-open", open);
    if (header) {
      header.classList.toggle("menu-open", open);
    }
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      toggle.classList.remove("nav-toggle--pulse");
      void toggle.offsetWidth;
      toggle.classList.add("nav-toggle--pulse");
      window.setTimeout(function () {
        toggle.classList.remove("nav-toggle--pulse");
      }, 720);
      var open = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuOpen(false);
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });
  }

  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var filterBtns = document.querySelectorAll(".filter-btn");
  var workItems = document.querySelectorAll(".work-item");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      workItems.forEach(function (item) {
        var raw = (item.getAttribute("data-category") || "").trim();
        var cats = raw.split(/\s+/).filter(Boolean);
        var show = filter === "all" || cats.indexOf(filter) !== -1;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  document.querySelectorAll(".service-card-hit").forEach(function (hit) {
    hit.addEventListener("click", function () {
      var card = hit.closest(".service-card");
      var panelId = hit.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      var isOpen = hit.getAttribute("aria-expanded") === "true";
      var next = !isOpen;

      if (next) {
        document.querySelectorAll("#servizi .service-card").forEach(function (other) {
          if (other === card) return;
          var otherBtn = other.querySelector(".service-card-hit");
          var otherPanelId = otherBtn && otherBtn.getAttribute("aria-controls");
          var otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          if (otherBtn) {
            otherBtn.setAttribute("aria-expanded", "false");
          }
          other.classList.remove("is-open");
          if (otherPanel) {
            otherPanel.setAttribute("aria-hidden", "true");
          }
        });
      }

      hit.setAttribute("aria-expanded", next ? "true" : "false");
      if (card) {
        card.classList.toggle("is-open", next);
      }
      if (panel) {
        panel.setAttribute("aria-hidden", next ? "false" : "true");
      }
    });
  });

  /* Hero: kie → chi → who in loop, effetto sfogliamento, 3s per parola */
  (function initHeroWordFlip() {
    var container = document.getElementById("hero-word-reels");
    if (!container) return;

    var flipRoot = container.querySelector(".hero-flip");
    var textEl = container.querySelector(".hero-flip-text");
    if (!flipRoot || !textEl) return;

    var sequence = ["kie", "chi", "who"];
    var currentIndex = 0;
    var wordDurationMs = 3000;
    var reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      flipRoot.classList.add("hero-flip--static");
      textEl.textContent = "kie, chi, who";
      container.setAttribute("aria-label", "kie, chi, who");
      return;
    }

    function setAriaWord(word) {
      container.setAttribute("aria-label", word);
    }

    function scheduleNextFlip() {
      window.setTimeout(goToNext, wordDurationMs);
    }

    function goToNext() {
      var nextIndex = (currentIndex + 1) % sequence.length;
      var nextWord = sequence[nextIndex];

      textEl.classList.add("is-fold-out");

      function onFoldOut(e) {
        if (e.propertyName !== "transform") return;
        textEl.removeEventListener("transitionend", onFoldOut);
        textEl.textContent = nextWord;
        currentIndex = nextIndex;
        setAriaWord(nextWord);
        textEl.classList.remove("is-fold-out");
        textEl.classList.add("is-fold-in");

        function onFoldIn(e) {
          if (e.animationName !== "hero-page-in") return;
          textEl.removeEventListener("animationend", onFoldIn);
          textEl.classList.remove("is-fold-in");
          scheduleNextFlip();
        }

        textEl.addEventListener("animationend", onFoldIn);
      }

      textEl.addEventListener("transitionend", onFoldOut);
    }

    function start() {
      setAriaWord(sequence[0]);
      scheduleNextFlip();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        requestAnimationFrame(start);
      });
    } else {
      window.setTimeout(start, 400);
    }
  })();
})();
