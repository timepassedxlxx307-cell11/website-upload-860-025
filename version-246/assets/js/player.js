function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var starter = document.getElementById('player-start');
    var hls = null;
    var ready = false;

    if (!video || !source) {
        return;
    }

    function bindStream() {
        if (ready) {
            return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        bindStream();
        if (starter) {
            starter.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (starter) {
                    starter.classList.remove('is-hidden');
                }
            });
        }
    }

    if (starter) {
        starter.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (starter) {
            starter.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (!video.ended && starter) {
            starter.classList.remove('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
