(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var category = (params.get('category') || '').trim();
    var input = document.getElementById('search-page-input');
    var select = document.getElementById('search-category-select');
    var results = document.getElementById('search-results');

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

    function movieCard(movie) {
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link">' +
            '<span class="poster-frame">' +
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
            '<span class="play-hover">▶</span>' +
            '</span>' +
            '<span class="card-body">' +
            '<span class="card-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></span>' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>' +
            '<span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></span>' +
            '</span>' +
            '</a>' +
            '</article>';
    }

    function render() {
        if (!results || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }
        var keyword = query.toLowerCase();
        var items = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags, movie.oneLine].join(' ').toLowerCase();
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var categoryMatched = !category || movie.category === category;
            return keywordMatched && categoryMatched;
        }).slice(0, 240);

        if (!items.length) {
            results.innerHTML = '<div class="article-block"><h2>没有找到匹配内容</h2><p>可以尝试更换片名、年份、地区或类型关键词。</p></div>';
            return;
        }

        results.innerHTML = items.map(movieCard).join('');
    }

    if (input) {
        input.value = query;
    }
    if (select) {
        select.value = category;
        select.addEventListener('change', function () {
            category = select.value;
            render();
        });
    }

    render();
})();
