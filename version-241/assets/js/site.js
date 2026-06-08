(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }
    show(0);
    start();
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]")).forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var select = panel.querySelector("[data-type-filter]");
      var section = panel.parentElement || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var rows = Array.prototype.slice.call(section.querySelectorAll("[data-ranking-row]"));

      function matchesCard(element, query, type) {
        var search = (element.getAttribute("data-search") || "").toLowerCase();
        var elementType = element.getAttribute("data-type") || "";
        var typeOk = !type || elementType === type;
        var queryOk = !query || search.indexOf(query) !== -1;
        return typeOk && queryOk;
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = select ? select.value : "";
        cards.forEach(function (card) {
          card.hidden = !matchesCard(card, query, type);
        });
        rows.forEach(function (row) {
          row.hidden = !matchesCard(row, query, type);
        });
      }

      if (input) {
        input.addEventListener("input", update);
      }
      if (select) {
        select.addEventListener("change", update);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
