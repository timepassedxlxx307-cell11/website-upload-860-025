var StaticMovieSite = (function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function textOf(value) {
        return (value || "").toString().toLowerCase();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
        if (!grids.length) {
            return;
        }
        grids.forEach(function (grid) {
            var section = grid.closest("section") || document;
            var searchInput = section.querySelector("[data-search-input]");
            var yearFilter = section.querySelector("[data-year-filter]");
            var regionFilter = section.querySelector("[data-region-filter]");
            var typeFilter = section.querySelector("[data-type-filter]");
            var categoryFilter = section.querySelector("[data-category-filter]");
            var countNode = section.querySelector("[data-filter-count]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

            function matches(card) {
                var query = textOf(searchInput && searchInput.value).trim();
                var year = yearFilter && yearFilter.value;
                var region = regionFilter && regionFilter.value;
                var type = typeFilter && typeFilter.value;
                var category = categoryFilter && categoryFilter.value;
                var title = textOf(card.getAttribute("data-title"));
                var cardYear = textOf(card.getAttribute("data-year"));
                var cardRegion = textOf(card.getAttribute("data-region"));
                var cardType = textOf(card.getAttribute("data-type"));
                var cardGenre = textOf(card.getAttribute("data-genre"));
                var cardCategory = textOf(card.getAttribute("data-category"));
                var haystack = [title, cardYear, cardRegion, cardType, cardGenre, cardCategory].join(" ");
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (year && cardYear !== textOf(year)) {
                    return false;
                }
                if (region && cardRegion.indexOf(textOf(region)) === -1) {
                    return false;
                }
                if (type && cardType.indexOf(textOf(type)) === -1) {
                    return false;
                }
                if (category && cardCategory !== textOf(category)) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var keep = matches(card);
                    card.classList.toggle("is-hidden", !keep);
                    if (keep) {
                        visible += 1;
                    }
                });
                if (countNode) {
                    countNode.textContent = visible.toString();
                }
            }

            [searchInput, yearFilter, regionFilter, typeFilter, categoryFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function mountPlayer(streamUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = document.getElementById("player-overlay");
            var playButton = document.getElementById("play-button");
            if (!video || !overlay || !streamUrl) {
                return;
            }
            var started = false;
            var hls = null;

            function beginPlayback() {
                overlay.classList.add("is-hidden");
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = streamUrl;
                        video.play();
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play();
                        });
                    } else {
                        video.src = streamUrl;
                        video.play();
                    }
                } else {
                    video.play();
                }
            }

            overlay.addEventListener("click", beginPlayback);
            if (playButton) {
                playButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    beginPlayback();
                });
            }
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });

    return {
        mountPlayer: mountPlayer
    };
})();
