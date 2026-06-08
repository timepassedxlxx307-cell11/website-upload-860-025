(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function attachStream(video, url) {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    video.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }).catch(function () {
      video.src = url;
    });
  }

  window.initializeMoviePlayer = function (url) {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');

    if (!video || !overlay) {
      return;
    }

    function start() {
      overlay.classList.add('is-hidden');
      attachStream(video, url).then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (!video.dataset.ready) {
        start();
      }
    });
  };
})();
