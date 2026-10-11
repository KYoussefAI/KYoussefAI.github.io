// Guided section-by-section scrolling. Native touch scrolling stays available
// for mobile, and reduced-motion preferences disable animated navigation.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

(() => {
  const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sectionRefs = [
    { selector: '#top', hash: '#top', label: 'Introduction' },
    { selector: '#work', hash: '#work', label: 'Selected work' },
    { selector: '#principles', hash: '#principles', label: 'Engineering notes' },
    { selector: '#about', hash: '#about', label: 'About' },
    { selector: '#contact', hash: '#contact', label: 'Contact' }
  ];
  const sections = sectionRefs
    .map((section) => ({ ...section, element: document.querySelector(section.selector) }))
    .filter((section) => section.element);
  const guided = () => desktop.matches && !reducedMotion.matches;
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const topOf = (element) => element.getBoundingClientRect().top + scrollY;

  let stops = [];
  let animationFrame = null;
  let blockedUntil = 0;
  let activeFrame = null;

  // Keep reading positions inside tall case studies: snapping only to the
  // start of each section could otherwise skip important content.
  function buildStops() {
    const landmarks = [
      document.querySelector('.main-project'),
      document.querySelector('.secondary-grid'),
      document.querySelector('.more-work'),
      document.querySelector('.site-footer'),
      ...sections.map((section) => section.element)
    ].filter(Boolean);

    const bottom = maxScroll();
    const anchors = [...new Set([0, bottom, ...landmarks.map((node) =>
      Math.max(0, Math.min(bottom, Math.round(topOf(node))))
    )])].sort((a, b) => a - b);

    const maxStep = Math.max(280, innerHeight * 0.82);
    stops = [0];
    for (let i = 1; i < anchors.length; i++) {
      const previous = anchors[i - 1];
      const next = anchors[i];
      const pieces = Math.ceil((next - previous) / maxStep);
      for (let j = 1; j <= pieces; j++) {
        const stop = Math.round(previous + (next - previous) * j / pieces);
        if (stop > stops[stops.length - 1] + 3) stops.push(stop);
      }
    }
  }

  function stopAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    document.documentElement.classList.remove('is-section-sliding');
  }

  function slide(direction) {
    if (performance.now() < blockedUntil) return;
    const current = scrollY;
    const margin = 24;
    const target = direction > 0
      ? stops.find((position) => position > current + margin)
      : [...stops].reverse().find((position) => position < current - margin);
    if (target === undefined) return;

    stopAnimation();
    const startTime = performance.now();
    const duration = 700;
    const distance = target - current;
    blockedUntil = startTime + 850;
    document.documentElement.classList.add('is-section-sliding');

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo({ top: current + distance * eased, behavior: 'instant' });
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        animationFrame = null;
        document.documentElement.classList.remove('is-section-sliding');
      }
    };
    animationFrame = requestAnimationFrame(tick);
  }

  function canScrollInside(target, direction) {
    for (let node = target; node && node !== document.body; node = node.parentElement) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      if (!['auto', 'scroll'].includes(style.overflowY) ||
          node.scrollHeight <= node.clientHeight + 2) continue;
      const hasRoom = direction > 0
        ? node.scrollTop + node.clientHeight < node.scrollHeight - 2
        : node.scrollTop > 2;
      if (hasRoom) return true;
    }
    return false;
  }

  window.addEventListener('wheel', (event) => {
    if (!guided() || event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !event.deltaY || canScrollInside(event.target, Math.sign(event.deltaY))) return;
    event.preventDefault();
    slide(Math.sign(event.deltaY));
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (!guided() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('input, textarea, select, button, [contenteditable="true"]')) return;
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    slide(direction);
  });

  const rail = document.createElement('nav');
  rail.className = 'section-rail';
  rail.setAttribute('aria-label', 'Jump between portfolio sections');
  for (const section of sections) {
    const link = document.createElement('a');
    link.href = section.hash;
    link.setAttribute('aria-label', section.label);
    link.dataset.label = section.label;
    link.addEventListener('click', () => {
      stopAnimation();
      blockedUntil = performance.now() + 850;
    });
    rail.append(link);
    section.link = link;
  }
  document.body.append(rail);

  function updateCurrentSection() {
    activeFrame = null;
    const readingY = scrollY + innerHeight * 0.3;
    let current = 0;
    sections.forEach((section, index) => {
      if (topOf(section.element) <= readingY) current = index;
    });
    sections.forEach((section, index) => {
      if (current === index) section.link.setAttribute('aria-current', 'location');
      else section.link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', () => {
    if (activeFrame === null) activeFrame = requestAnimationFrame(updateCurrentSection);
  }, { passive: true });

  window.addEventListener('resize', () => {
    stopAnimation();
    buildStops();
    updateCurrentSection();
  });

  // Do not fight native hash navigation or dynamic page height changes.
  window.addEventListener('load', () => {
    buildStops();
    updateCurrentSection();
  });
  buildStops();
  updateCurrentSection();
})();
