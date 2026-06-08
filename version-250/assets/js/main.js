(function () {
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  function schedule() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      schedule();
    });
  });

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(active - 1);
      schedule();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(active + 1);
      schedule();
    });
  }

  showSlide(0);
  schedule();

  document.querySelectorAll('.catalogue-board').forEach(function (board) {
    var input = board.querySelector('.search-input');
    var chips = Array.prototype.slice.call(board.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(board.querySelectorAll('.movie-card'));
    var empty = board.querySelector('.empty-state');
    var activeFilter = '全部';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));
    }

    function updateCards() {
      var keyword = input ? normalize(input.value) : '';
      var filter = normalize(activeFilter);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = cardText(card);
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var filterMatch = activeFilter === '全部' || haystack.indexOf(filter) !== -1;
        var matched = keywordMatch && filterMatch;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', updateCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.dataset.filter || '全部';

        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });

        updateCards();
      });
    });
  });
})();
