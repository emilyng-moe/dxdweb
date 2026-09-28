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
});
