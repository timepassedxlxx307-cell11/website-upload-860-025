(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var keyword = panel.querySelector("[data-filter-keyword]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var section = panel.closest("section");
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]")) : [];
      var empty = section ? section.querySelector("[data-empty-state]") : null;

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
          var matchKeyword = !q || haystack.indexOf(q) !== -1;
          var matchType = !selectedType || card.dataset.type === selectedType;
          var matchYear = !selectedYear || card.dataset.year === selectedYear;
          var matched = matchKeyword && matchType && matchYear;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupImageFallback() {
    Array.prototype.slice.call(document.images).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      });
    });
  }

  onReady(function () {
    setupMobileNav();
    setupHeroSlider();
    setupCardFilters();
    setupImageFallback();
  });
})();
