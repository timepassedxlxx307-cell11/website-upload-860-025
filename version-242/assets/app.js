(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
      panel.setAttribute("aria-hidden", opened ? "false" : "true");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
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
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    start();
  }

  function initCategoryFilter() {
    var input = document.querySelector("#category-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    if (!input || cards.length === 0) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card normal">',
      '<a class="poster-link" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta">' + escapeHtml(movie.meta) + '</div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.text) + '</p>',
      '<div class="tag-row">' + movie.tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var input = document.querySelector("#global-search");
    var results = document.querySelector("#search-results");
    var status = document.querySelector("#search-status");
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var query = input.value.trim().toLowerCase();
      var source = window.SEARCH_MOVIES;
      var matched = query ? source.filter(function (movie) {
        return movie.search.indexOf(query) !== -1;
      }) : source.slice(0, 48);
      var shown = matched.slice(0, 120);
      results.innerHTML = shown.map(renderSearchCard).join("");
      if (status) {
        status.textContent = query ? "搜索结果" : "热门推荐";
      }
      if (shown.length === 0) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initCategoryFilter();
    initSearchPage();
  });
})();

function createMoviePlayer(videoSource) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  if (!video || !overlay || !videoSource) {
    return;
  }
  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoSource;
    }
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add("is-hidden");
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
