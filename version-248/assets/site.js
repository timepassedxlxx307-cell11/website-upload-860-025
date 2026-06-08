(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs("[data-mobile-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = qs("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = qsa("[data-hero-slide]", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var input = qs("[data-search-input]", panel);
      var region = qs("[data-filter-region]", panel);
      var genre = qs("[data-filter-genre]", panel);
      var reset = qs("[data-filter-reset]", panel);
      var cards = qsa("[data-movie-card]", section);
      var grid = cards.length ? cards[0].parentElement : null;
      var empty = null;

      function cardValue(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ");
      }

      function ensureEmpty() {
        if (!grid) {
          return null;
        }
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "no-results";
          empty.textContent = "没有匹配的内容";
          grid.appendChild(empty);
        }
        return empty;
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "全部");
        var genreValue = normalize(genre ? genre.value : "全部");
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize(cardValue(card));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okRegion = regionValue === "全部" || haystack.indexOf(regionValue) !== -1;
          var okGenre = genreValue === "全部" || haystack.indexOf(genreValue) !== -1;
          var visible = okKeyword && okRegion && okGenre;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });

        var emptyNode = ensureEmpty();
        if (emptyNode) {
          emptyNode.style.display = shown ? "none" : "block";
        }
      }

      [input, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "全部";
          }
          if (genre) {
            genre.value = "全部";
          }
          apply();
        });
      }
    });
  }

  function mountMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    mount: mountMoviePlayer
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
