// Natural wheel/touch scrolling; enhanced motion without scroll hijacking.
(() => {
  document.documentElement.classList.add('js');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }
  const bar = document.getElementById('scroll-progress');
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let frame = 0;
  const refresh = () => {
    frame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / max));
    if (bar) bar.style.transform = `scaleX(${progress})`;
    const point = scrollY + innerHeight * .32;
    let active = null;
    for (const s of sections) if (s.offsetTop <= point) active = `#${s.id}`;
    for (const link of links) {
      if (link.getAttribute('href') === active) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(refresh); }, { passive:true });
  addEventListener('resize', refresh, { passive:true });
  refresh();
  // Smooth anchored navigation is native CSS (html scroll-behavior:smooth).
  // Nothing intercepts mouse wheel, touch gestures or arrow keys.
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const hero = document.querySelector('.hero-visual');
    if (hero) {
      const observer = new IntersectionObserver(([entry]) => {
        hero.classList.toggle('visual-visible',entry.isIntersecting);
      }, {threshold:.18});
      observer.observe(hero);
    }
  }
})();
