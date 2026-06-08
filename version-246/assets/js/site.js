(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.trim() : '';
            var target = './search.html';
            if (keyword) {
                target += '?q=' + encodeURIComponent(keyword);
            }
            window.location.href = target;
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === activeIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setHero(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(activeIndex + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
        var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
        var list = document.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter');
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                cards.forEach(function (card) {
                    var type = card.getAttribute('data-type') || '';
                    var visible = value === 'all' || type.indexOf(value) !== -1;
                    card.classList.toggle('is-hidden', !visible);
                });
            });
        });
    });
})();
