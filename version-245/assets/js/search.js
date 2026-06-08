(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<div class="card-tags"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function render() {
    var list = window.SEARCH_MOVIES || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var type = document.querySelector("[data-search-type]");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("searchEmpty");
    if (!form || !input || !type || !results || !empty) {
      return;
    }

    input.value = getQuery();

    function apply() {
      var q = input.value.trim().toLowerCase();
      var selectedType = type.value;
      var matched = list.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        var okKeyword = !q || haystack.indexOf(q) !== -1;
        var okType = !selectedType || movie.type === selectedType;
        return okKeyword && okType;
      }).slice(0, 160);

      results.innerHTML = matched.map(card).join("");
      empty.classList.toggle("is-visible", matched.length === 0);

      Array.prototype.slice.call(results.querySelectorAll("img")).forEach(function (img) {
        img.addEventListener("error", function () {
          img.classList.add("is-missing");
        });
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = new URLSearchParams();
      if (input.value.trim()) {
        params.set("q", input.value.trim());
      }
      var target = params.toString() ? "search.html?" + params.toString() : "search.html";
      window.history.replaceState(null, "", target);
      apply();
    });

    input.addEventListener("input", apply);
    type.addEventListener("change", apply);
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
