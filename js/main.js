// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generic tabs: click or arrow-key through [role="tab"] to show its [role="tabpanel"].
  // Deep-links via the tab's data-target matching the URL hash (e.g. products.html#platforms).
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const activate = (tab, { focus = false, updateHash = true } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle('active', selected);
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.classList.toggle('active', selected);
      });
      if (focus) tab.focus();
      if (updateHash && tab.dataset.target) {
        history.replaceState(null, '', '#' + tab.dataset.target);
      }
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        activate(tabs[(i + dir + tabs.length) % tabs.length], { focus: true });
      });
    });
    const hash = window.location.hash.replace('#', '');
    const matchByHash = tabs.find((t) => t.dataset.target === hash);
    if (matchByHash) activate(matchByHash, { updateHash: false });
  });

  // Illustrations draw in / float / spin only once scrolled into view
  const illusEls = document.querySelectorAll('.illus-trigger');
  if (illusEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      illusEls.forEach((el) => el.classList.add('in-view'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      illusEls.forEach((el) => io.observe(el));
    }
  }

  // Major chapter-break rules draw in when scrolled into view
  const ruleEls = document.querySelectorAll('.rule-major');
  if (ruleEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      ruleEls.forEach((el) => el.classList.add('in-view'));
    } else {
      const ruleIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            ruleIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      ruleEls.forEach((el) => ruleIo.observe(el));
    }
  }

  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------------------------------------------------------------
  // Generic scroll-reveal: any [class*="reveal"] element gets .in-view
  // the first time it crosses the viewport, then is left alone.
  // ---------------------------------------------------------------
  const revealEls = document.querySelectorAll('[class*="reveal"]');
  if (revealEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in-view'));
    } else {
      const revealIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach((el) => revealIo.observe(el));
    }
  }

  // ---------------------------------------------------------------
  // Parallax: [data-parallax] (vertical) / [data-parallax-x] (horizontal)
  // elements drift based on distance from viewport center — at rest when
  // centered, shifting as they scroll away. Desktop, motion-safe only;
  // a single rAF-throttled scroll/resize loop drives every tracked element.
  // ---------------------------------------------------------------
  if (!reduced && fineHover && window.innerWidth > 767) {
    const parallaxEls = Array.from(document.querySelectorAll('[data-parallax], [data-parallax-x]'));
    if (parallaxEls.length) {
      let ticking = false;
      const updateParallax = () => {
        const viewportCenter = window.innerHeight / 2;
        parallaxEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const elCenter = rect.top + rect.height / 2;
          const distance = viewportCenter - elCenter;
          const rateY = parseFloat(el.dataset.parallax || '0');
          const rateX = parseFloat(el.dataset.parallaxX || '0');
          const y = rateY ? distance * rateY : 0;
          const x = rateX ? distance * rateX : 0;
          const scaleAttr = el.dataset.parallaxScale;
          let extra = '';
          if (scaleAttr) {
            // Scales down slightly the further the element drifts above center
            // (used for the hero mark's "scale toward the next section" moment).
            const maxScale = parseFloat(scaleAttr);
            const progress = Math.min(Math.max(-distance / (window.innerHeight * 0.9), 0), 1);
            const scale = 1 - progress * (1 - maxScale);
            extra = ` scale(${scale})`;
          }
          // Compose with a static base transform (e.g. translateX(-50%) for a
          // centered element) rather than overwriting it every frame.
          const base = el.dataset.parallaxBase ? el.dataset.parallaxBase + ' ' : '';
          el.style.transform = `${base}translate(${x}px, ${y}px)${extra}`;
        });
        ticking = false;
      };
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };
      window.addEventListener('scroll', requestTick, { passive: true });
      window.addEventListener('resize', requestTick);
      updateParallax();
    }

    // Blueprint grid: shifts its background-position slightly as the hero
    // scrolls past, independent of the parallax elements above.
    const blueprintHero = document.querySelector('.hero-grid')?.closest('.blueprint');
    if (blueprintHero) {
      let bpTicking = false;
      const updateGrid = () => {
        const rect = blueprintHero.getBoundingClientRect();
        const shift = -rect.top * 0.15;
        // x stays "50%" for the horizontal-line layer and "50% + 32px" for
        // the vertical-line layer — matching .blueprint's own CSS rule,
        // which offsets that layer by half a tile so a line lands exactly
        // at center instead of the gap between two lines. Only y animates.
        blueprintHero.style.backgroundPosition = `50% ${shift}px, calc(50% + 32px) ${shift}px`;
        bpTicking = false;
      };
      window.addEventListener('scroll', () => {
        if (!bpTicking) { requestAnimationFrame(updateGrid); bpTicking = true; }
      }, { passive: true });
      updateGrid();
    }
  }

  // Product cards: a very subtle cursor-follow on the icon inside each cell.
  // Bakes in the same lift + scale the CSS :hover rule would apply, since
  // this inline transform takes over from (and would otherwise hide) it.
  if (!reduced && fineHover) {
    document.querySelectorAll('.cell-magnetic').forEach((cell) => {
      const icon = cell.querySelector('.cell-icon');
      if (!icon) return;
      cell.addEventListener('mousemove', (e) => {
        const rect = cell.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        icon.style.transform = `translate(${x * 6}px, ${y * 6 - 2}px) scale(1.06)`;
      });
      cell.addEventListener('mouseleave', () => { icon.style.transform = ''; });
    });
  }
});
