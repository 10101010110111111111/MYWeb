async function loadAnime() {
  // 1) zkuste nainstalovaný balíček (funguje s bundlerem/dev-serverem s module resolution)
  try {
    const mod = await import('animejs');
    return mod;
  } catch (_) {}

  // 2) zkuste ESM z CDN
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/animejs@4/+esm');
    return mod;
  } catch (_) {}

  // 3) fallback na IIFE globál
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/animejs@4.0.0/lib/anime.iife.min.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Anime.js IIFE failed to load'));
    document.head.appendChild(s);
  });
  return window.anime;
}

(async () => {
  const api = await loadAnime();
  const hasV4 = !!api.animate;

  // utils adapter
  const utils = api.utils || {
    $(selector, root = document) { return Array.from(root.querySelectorAll(selector)); },
    clamp(value, min, max) { return Math.max(min, Math.min(max, value)); },
  };

  // props mapper for v3
  const mapProps = (props) => {
    const mapped = { ...props };
    if (Object.prototype.hasOwnProperty.call(mapped, 'x')) { mapped.translateX = mapped.x; delete mapped.x; }
    if (Object.prototype.hasOwnProperty.call(mapped, 'y')) { mapped.translateY = mapped.y; delete mapped.y; }
    return mapped;
  };

  // animate adapter (v4 or v3)
  const animateX = (targets, props) => {
    return hasV4 ? api.animate(targets, props) : api({ targets, ...mapProps(props) });
  };

  // createAnimatable adapter
  const createAnimatableX = api.createAnimatable || ((selector, opts = {}) => {
    const durationX = typeof opts.x === 'number' ? opts.x : 500;
    const durationY = typeof opts.y === 'number' ? opts.y : 500;
    const ease = opts.ease || 'linear';
    return {
      x(value) { animateX(selector, { x: value, duration: durationX, easing: ease }); },
      y(value) { animateX(selector, { y: value, duration: durationY, easing: ease }); },
    };
  });

  // createTimeline adapter (minimal)
  const createTimelineX = api.createTimeline || ((options = {}) => {
    const tl = api.timeline ? api.timeline({ autoplay: options.autoplay ?? false, loop: options.loop ?? false }) : null;
    const wrapper = {
      add(target, props) { if (tl) tl.add({ targets: target, ...mapProps(props) }); return wrapper; },
      seek(ms) { if (tl && typeof tl.seek === 'function') tl.seek(ms); },
      get duration() { return tl ? tl.duration : (options.duration || 2000); },
      play() { if (tl && tl.play) tl.play(); },
      pause() { if (tl && tl.pause) tl.pause(); },
    };
    return wrapper;
  });

  // Základní ukázky animací (omezeno na sekci #basic-demos)
  animateX('#basic-demos .square', { x: '17rem' });
  animateX('#basic-demos #css-selector-id', { rotate: '1turn' });
  animateX('#basic-demos .row:nth-child(3) .square', { scale: [1, 0.5, 1] });

  // Přidané demo s createAnimatable + utils (svázané na demo oblast)
  const $demos = document.querySelector('#docs-demos');
  const $demo = $demos ? $demos.querySelector('.docs-demo.is-active') : null;

  if ($demos && $demo) {
    let bounds = $demo.getBoundingClientRect();
    const refreshBounds = () => {
      bounds = $demo.getBoundingClientRect();
    };

    const animatableSquare = createAnimatableX('.docs-demo.is-active .square', {
      x: 500,
      y: 500,
      ease: 'out(3)'
    });

    const onMouseMoveHandler = (e) => {
      const { width, height, left, top } = bounds;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const x = utils.clamp(e.clientX - left - halfWidth, -halfWidth, halfWidth);
      const y = utils.clamp(e.clientY - top - halfHeight, -halfHeight, halfHeight);
      animatableSquare.x(x);
      animatableSquare.y(y);
    };

    window.addEventListener('mousemove', onMouseMoveHandler);
    $demos.addEventListener('scroll', refreshBounds);
    window.addEventListener('resize', refreshBounds);
  }

  // Scroll demo (bez závislosti na onScroll, kompatibilní napříč verzemi)
  const $scroll = document.querySelector('#scroll-auto-play-on-scroll');
  if ($scroll) {
    const [ container ] = utils.$('.scroll-container', $scroll);
    if (container) {
      const TOTAL_MS = 2000;
      const updateByProgress = (p) => {
        const angle = p * 360;
        const px = p * 240; // ~15rem
        animateX('#scroll-auto-play-on-scroll .square', { x: px, rotate: angle + 'deg', duration: 120, easing: 'linear' });

        const circles = utils.$('.circle', $scroll);
        circles.forEach((el, idx) => {
          animateX(el, { x: p * 144, duration: 120, easing: 'linear' });
        });

        const [ $timer ] = utils.$('.timer', $scroll);
        if ($timer) $timer.textContent = String(Math.floor(p * TOTAL_MS));
      };

      const onScrollHandler = () => {
        const max = container.scrollHeight - container.clientHeight;
        const p = max > 0 ? container.scrollTop / max : 0;
        updateByProgress(p);
      };

      onScrollHandler();
      container.addEventListener('scroll', onScrollHandler, { passive: true });
      window.addEventListener('resize', onScrollHandler);
    }
  }
})();


