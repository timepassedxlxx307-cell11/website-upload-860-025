(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function text(value) {
    return String(value == null ? "" : value);
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!form || !input || !list) {
      return;
    }

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        card.style.display = haystack.indexOf(query) === -1 ? "none" : "";
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });
    input.addEventListener("input", applyFilter);
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || typeof movieIndex === "undefined") {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var summary = page.querySelector("[data-search-summary]");
    var params = new URLSearchParams(location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function movieCard(movie) {
      var tags = [movie.region, movie.type, movie.genre].filter(Boolean).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.url) + "\">" +
        "<div class=\"card-poster\"><img src=\"./" + escapeHtml(movie.cover) + ".jpg\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><div class=\"card-play\">▶</div></div>" +
        "<div class=\"card-body\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<div class=\"card-tags\">" + tags + "</div></div></a>";
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var data = movieIndex.filter(function (movie) {
        if (!query) {
          return true;
        }
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.tags].join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).slice(0, 80);
      results.innerHTML = data.map(movieCard).join("");
      summary.textContent = query ? "搜索结果：" + input.value.trim() : "热门内容";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      history.replaceState(null, "", url.toString());
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  function initPlayer() {
    var video = document.querySelector("video[data-video]");
    if (!video) {
      return;
    }
    var button = document.querySelector("[data-player-toggle]");
    var src = video.getAttribute("data-video");
    var loaded = false;

    function attach() {
      if (loaded || !src) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (typeof Hls !== "undefined" && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.hls = hls;
        return;
      }
      video.src = src;
    }

    attach();
    video.addEventListener("click", attach);
    video.addEventListener("play", attach);
    if (button) {
      button.addEventListener("click", function () {
        attach();
        var playAction = video.play();
        if (playAction && typeof playAction.catch === "function") {
          playAction.catch(function () {});
        }
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
