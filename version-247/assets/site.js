(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startHero = function () {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        startHero();
      });
    });

    startHero();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter-input'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

  var filterList = function (targetSelector, text, chip) {
    var target = document.querySelector(targetSelector);
    if (!target) {
      return;
    }
    var query = (text || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(target.children);
    cards.forEach(function (card) {
      var meta = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var textMatched = !query || meta.indexOf(query) !== -1;
      var chipMatched = !chip || chip === 'all' || type === chip || meta.indexOf(chip.toLowerCase()) !== -1;
      card.classList.toggle('is-filtered-out', !(textMatched && chipMatched));
    });
  };

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var target = input.getAttribute('data-filter-target');
      var activeButton = document.querySelector('[data-filter-target="' + target + '"].filter-chips .is-active');
      var chip = activeButton ? activeButton.getAttribute('data-filter-chip') : 'all';
      filterList(target, input.value, chip);
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var wrap = button.closest('.filter-chips');
      var target = wrap ? wrap.getAttribute('data-filter-target') : null;
      if (!target) {
        return;
      }
      Array.prototype.slice.call(wrap.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      var input = document.querySelector('.page-filter-input[data-filter-target="' + target + '"]');
      filterList(target, input ? input.value : '', button.getAttribute('data-filter-chip'));
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
  players.forEach(function (video) {
    var stream = video.getAttribute('data-stream');
    var shell = video.closest('.player-shell');
    var overlay = shell ? shell.querySelector('.player-overlay') : null;
    var hls = null;

    var loadVideo = function () {
      if (!stream || video.getAttribute('data-ready') === 'true') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', 'true');
    };

    var playVideo = function () {
      loadVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });

  var searchInput = document.getElementById('search-page-input');
  var searchResults = document.getElementById('search-results');
  var searchStatus = document.getElementById('search-status');

  if (searchInput && searchResults && window.MOVIE_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    var createCard = function (movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      article.innerHTML = '' +
        '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="play-badge">▶</span>' +
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>';
      return article;
    };

    var runSearch = function () {
      var query = searchInput.value.trim().toLowerCase();
      var list = window.MOVIE_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = '';
      list.forEach(function (movie) {
        searchResults.appendChild(createCard(movie));
      });
      searchStatus.textContent = query ? '搜索结果' : '热门内容';
    };

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
