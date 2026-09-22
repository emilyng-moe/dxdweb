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

  // Sliding pill nav indicator: glides behind the hovered link, or the
  // current page's link at rest. Desktop only — hidden on mobile via CSS.
  if (links) {
    const pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    links.insertBefore(pill, links.firstChild);
    const navAnchors = Array.from(links.querySelectorAll('a'));
    const movePillTo = (el) => {
      const containerRect = links.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      pill.style.transform = `translateX(${rect.left - containerRect.left}px)`;
      pill.style.width = rect.width + 'px';
      pill.classList.add('visible');
    };
    const current = navAnchors.find((a) => a.getAttribute('aria-current') === 'page');
    if (current) movePillTo(current);
    navAnchors.forEach((a) => a.addEventListener('mouseenter', () => movePillTo(a)));
    links.addEventListener('mouseleave', () => {
      if (current) movePillTo(current);
      else pill.classList.remove('visible');
    });
    window.addEventListener('resize', () => {
      const hovered = links.querySelector('a:hover');
      movePillTo(hovered || current || navAnchors[0]);
    });
  }

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

  // Stat numbers count up when scrolled into view
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length && !reduced && 'IntersectionObserver' in window) {
    const animateStat = (el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d,]+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1].replace(/,/g, ''), 10);
      const suffix = match[2];
      if (!target) return;
      const duration = 900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      };
      requestAnimationFrame(step);
    };
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach((el) => statIo.observe(el));
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

  // Hero mark tilts gently toward the cursor
  const heroMark = document.querySelector('.hero-mark-wrap');
  const heroRight = document.querySelector('.hero-right');
  if (heroMark && heroRight && !reduced) {
    heroRight.addEventListener('mousemove', (e) => {
      const rect = heroRight.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroMark.style.transform = `rotateY(${x * 16}deg) rotateX(${y * -16}deg)`;
    });
    heroRight.addEventListener('mouseleave', () => {
      heroMark.style.transform = '';
    });
  }
});
