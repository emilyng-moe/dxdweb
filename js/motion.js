// ============================================================================
// Scroll motion. One rAF-throttled loop drives every scroll-linked value;
// pins are plain CSS position:sticky, so nothing hijacks native scrolling.
// Reveals ([data-reveal], [data-split]) use a single IntersectionObserver.
// Under prefers-reduced-motion everything is put in its finished state and
// no scroll-linked task runs.
// ============================================================================
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 901px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const cell = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) || 64;

  // --------------------------------------------------- shared auto-tags
  // Pages that don't mark up their own motion still get the system: section
  // headings rise word by word, and grid cells assemble in reading order.
  document.querySelectorAll('.side-head-title').forEach((h) => {
    if (!h.hasAttribute('data-split') && h.children.length === 0) h.setAttribute('data-split', '');
  });
  document.querySelectorAll('.divider-grid').forEach((grid) => {
    Array.from(grid.children).forEach((c, i) => {
      if (c.hasAttribute('data-reveal')) return;
      c.setAttribute('data-reveal', 'up');
      c.style.setProperty('--d', `${(i % 4) * 90}ms`);
    });
  });

  // ---------------------------------------------------------------- split
  // Wraps each word of a [data-split] element in a mask so it can rise on
  // its own. The heading keeps its full text as its accessible name.
  document.querySelectorAll('[data-split]').forEach((el) => {
    const heading = el.closest('h1, h2, h3, h4');
    if (heading && !heading.hasAttribute('aria-label')) {
      heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
    }
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const mask = document.createElement('span');
      mask.className = 'w';
      mask.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  // ---------------------------------------------------------- word fill
  const fillEl = document.querySelector('[data-fill]');
  let fillWords = [];
  if (fillEl) {
    const words = fillEl.textContent.trim().split(/\s+/);
    fillEl.textContent = '';
    fillWords = words.map((word, i) => {
      const span = document.createElement('span');
      span.className = 'fill-word';
      span.textContent = word;
      fillEl.appendChild(span);
      if (i < words.length - 1) fillEl.appendChild(document.createTextNode(' '));
      return span;
    });
  }

  // ------------------------------------------------------------ reveals
  const team = document.querySelector('[data-team]');
  const teamPinned = () => team && desktop.matches && !reduced;
  const limeSections = Array.from(document.querySelectorAll('[data-lime-grow]'));
  const revealEls = Array.from(document.querySelectorAll('[data-reveal], [data-split]'));
  const teamRevealEls = team ? revealEls.filter((el) => team.contains(el)) : [];
  // Content inside a lime section (pinned Team, or a growing lime CTA) is
  // revealed by the lime expansion itself, once it has filled the section.
  const heldByLime = (el) => (teamPinned() && team.contains(el)) || (!reduced && limeSections.some((sec) => sec.contains(el)));
  // Chromium's IntersectionObserver applies an element's own clip-path, so
  // a fully clipped (wipe) element never intersects; those are checked by
  // position in the scroll loop instead.
  const isClip = (el) => /^(wipe|grid)/.test(el.dataset.reveal || '');
  const clipEls = revealEls.filter(isClip);

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
    fillWords.forEach((w) => w.classList.add('on'));
    clipEls.length = 0;
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (heldByLime(entry.target)) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.filter((el) => !isClip(el)).forEach((el) => io.observe(el));
  }

  // ------------------------------------------------------ header detach
  const header = document.querySelector('.site-header');
  const updateHeader = () => header && header.classList.toggle('is-floating', window.scrollY > 24);

  // ------------------------------------------------ scroll-linked tasks
  const tasks = [];

  if (clipEls.length) {
    tasks.push((vh) => {
      clipEls.forEach((el) => {
        // getClientRects() is empty while the element is hidden (an inactive
        // tab panel), so hidden tiles wait and animate when their tab opens.
        if (el.classList.contains('is-in') || !el.getClientRects().length) return;
        if (el.getBoundingClientRect().top < vh * 0.85) el.classList.add('is-in');
      });
    });
  }

  // Hero: the three headline lines drift apart horizontally, the compass
  // turns a quarter of its symmetry and lifts, the grid thins out and
  // slides, and the lime cell steps left along its row one cell at a time.
  const hero = document.querySelector('[data-hero]');
  if (hero && !reduced) {
    const lines = Array.from(hero.querySelectorAll('[data-drift]'));
    const mark = hero.querySelector('[data-hero-mark]');
    const heroCell = hero.querySelector('[data-hero-cell]');
    const foot = hero.querySelector('.hero-foot');
    tasks.push((vh, vw) => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const p = clamp(-rect.top / (rect.height * 0.9));
      const reach = desktop.matches ? vw * 0.09 : vw * 0.05;
      lines.forEach((line) => {
        line.style.transform = `translate3d(${parseFloat(line.dataset.drift) * p * reach}px,0,0)`;
      });
      if (mark) mark.style.transform = `translate3d(0,${-p * vh * 0.18}px,0) rotate(${p * 45}deg) scale(${1 + p * 0.12})`;
      if (heroCell) heroCell.style.transform = `translate3d(${-Math.round(p * (desktop.matches ? 5 : 3)) * heroCell.offsetWidth}px,0,0)`;
      if (foot) foot.style.opacity = String(1 - clamp(p * 1.6));
      hero.style.setProperty('--grid-y', `${-p * cell() * 1.5}px`);
      hero.style.setProperty('--grid-o', String(1 - p * 0.7));
    });
  }

  // Mission: words fill in as the section is scrolled through (pinned on
  // desktop; scrolled past normally on smaller screens).
  const statement = document.querySelector('[data-statement]');
  if (statement && fillWords.length && !reduced) {
    tasks.push((vh) => {
      const rect = statement.getBoundingClientRect();
      let p;
      if (desktop.matches) {
        p = clamp((-rect.top) / (rect.height - vh) / 0.8 - 0.05);
      } else {
        const text = fillEl.getBoundingClientRect();
        p = clamp((vh * 0.85 - text.top) / (vh * 0.6));
      }
      const count = Math.round(p * fillWords.length);
      fillWords.forEach((w, i) => w.classList.toggle('on', i < count));
    });
  }

  // Functions: the item nearest the viewport centre is active; the stage's
  // visual, counter and lime cell follow it, and a line extends down the
  // stage edge with overall progress.
  const fnSection = document.querySelector('[data-functions]');
  if (fnSection) {
    const items = Array.from(fnSection.querySelectorAll('[data-fn-item]'));
    const visuals = Array.from(fnSection.querySelectorAll('[data-fn-visual]'));
    const stage = fnSection.querySelector('.fn-stage-inner');
    const list = fnSection.querySelector('.fn-list');
    let active = -1;
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      visuals.forEach((v, k) => {
        v.classList.toggle('is-active', k === i);
        v.classList.toggle('is-past', k < i);
        if (k === i) v.classList.add('was-active');
      });
      if (stage) {
        stage.dataset.active = String(i);
        stage.style.setProperty('--fn-i', i);
      }
    };
    setActive(0);
    tasks.push((vh) => {
      const mid = vh * 0.5;
      let best = 0;
      items.forEach((it, k) => {
        if (it.getBoundingClientRect().top < mid) best = k;
      });
      setActive(best);
      if (stage && list) {
        const r = list.getBoundingClientRect();
        stage.style.setProperty('--fn-p', clamp((mid - r.top) / r.height).toFixed(4));
      }
    });
  }

  // Team: the lime cell at the top of the section's right-hand column grows
  // to fill the viewport; once full, the content reveals in sequence.
  if (team) {
    const lime = team.querySelector('[data-team-lime]');
    const inner = team.querySelector('.team-inner');
    let open = null;
    const setOpen = (isOpen) => {
      if (isOpen === open) return;
      open = isOpen;
      teamRevealEls.forEach((el) => el.classList.toggle('is-in', isOpen));
    };
    tasks.push((vh, vw) => {
      const pinned = teamPinned();
      team.classList.toggle('is-pinned', pinned);
      if (!pinned) {
        lime.style.clipPath = '';
        return;
      }
      const rect = team.getBoundingClientRect();
      const c = inner.getBoundingClientRect();
      const size = cell();
      const p = easeInOut(clamp((vh * 0.55 - rect.top) / (vh * 1.35)));
      const q = 1 - p;
      const top = 0;
      const right = (vw - c.right) * q;
      const bottom = (vh - size) * q;
      const left = (c.right - size) * q;
      lime.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      setOpen(p > 0.97);
    });
  }


  // Page heroes: the lime cell steps down its free right-hand column, one
  // whole cell at a time, as the hero scrolls away.
  document.querySelectorAll('[data-cell-step]').forEach((el) => {
    const section = el.closest('section');
    if (!section || reduced) return;
    tasks.push(() => {
      if (!desktop.matches) { el.style.transform = ''; return; }
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const p = clamp(-rect.top / (rect.height * 0.7));
      el.style.transform = `translate3d(0,${Math.round(p * 3) * cell()}px,0)`;
    });
  });

  // Lime CTAs: the section's lime grows out of a single cell at the top of
  // its right-hand column as it scrolls into view (no pin), then the
  // content reveals in sequence.
  limeSections.forEach((section) => {
    const bg = section.querySelector('[data-lime-bg]');
    const inner = section.querySelector('.lime-cta-inner');
    const held = revealEls.filter((el) => section.contains(el));
    if (reduced || !bg || !inner) return;
    let open = null;
    tasks.push((vh, vw) => {
      const rect = section.getBoundingClientRect();
      const c = inner.getBoundingClientRect();
      const size = desktop.matches ? cell() : 40;
      const p = easeInOut(clamp((vh * 0.92 - rect.top) / (vh * 0.62)));
      const q = 1 - p;
      bg.style.clipPath = `inset(0px ${(vw - c.right) * q}px ${(rect.height - size) * q}px ${(c.right - size) * q}px)`;
      const isOpen = p > 0.9;
      if (isOpen !== open) {
        open = isOpen;
        held.forEach((el) => el.classList.toggle('is-in', isOpen));
      }
    });
  });

  if (!tasks.length && !header) return;

  let ticking = false;
  const run = () => {
    ticking = false;
    updateHeader();
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    tasks.forEach((t) => t(vh, vw));
  };
  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  };
  window.addEventListener('scroll', request, { passive: true });
  // Opening a tab reveals tiles that were hidden inside its panel.
  document.addEventListener('click', (e) => { if (e.target.closest('[role="tab"]')) request(); });
  document.addEventListener('keyup', (e) => { if (e.target.closest && e.target.closest('[role="tab"]')) request(); });
  window.addEventListener('resize', request);
  desktop.addEventListener('change', request);
  run();
})();
