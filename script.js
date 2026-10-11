// Full-section presentation navigation. Every wheel gesture advances to the next
// complete slide, with one project per screen instead of arbitrary pixel stops.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const hero = main.querySelector('.hero');
  const statement = main.querySelector('.statement-band');
  const work = main.querySelector('.work-section');
  const principles = main.querySelector('.principles');
  const about = main.querySelector('.about-section');
  const contact = main.querySelector('.contact-section');
  const footer = document.querySelector('.site-footer');
  const workContainer = work?.querySelector('.shell');
  const cases = [...(workContainer?.querySelectorAll('.secondary-grid > .secondary-case') || [])];
  const moreWork = workContainer?.querySelector('.more-work');
  if (!hero || !statement || !work || !principles || !about || !contact || cases.length !== 2 || !footer) return;

  const make = (tag, cls, attributes = {}) => {
    const node = document.createElement(tag);
    node.className = cls;
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const intro = make('section', 'viewport-stage intro-stage', { id: 'intro', 'aria-label': 'Introduction' });
  intro.append(hero, statement);
  hero.removeAttribute('id');
  work.classList.add('viewport-stage', 'featured-stage');
  const unusedGrid = workContainer.querySelector('.secondary-grid');
  unusedGrid.remove();
  moreWork?.remove();
  const projects = [
    { id: 'amazon', label: '02 / STREAMING SYSTEM', name: 'Amazon Reviews', item: cases[0], cls: 'amazon-stage' },
    { id: 'job-pipeline', label: '03 / DATA PIPELINE', name: 'French Job Market', item: cases[1], cls: 'jobs-stage' }
  ].map(({id,label,name,item,cls}) => {
    const stage = make('section', 'viewport-stage individual-project-stage ' + cls, {
      id, 'aria-label': name
    });
    const shell = make('div', 'shell project-slide-layout');
    const heading = make('div', 'slide-heading');
    const count = make('span', 'section-number');
    count.textContent = label;
    const kicker = make('p', 'slide-kicker');
    kicker.textContent = name === 'Amazon Reviews'
      ? 'From events to decisions.'
      : 'A timestamp changes the story.';
    heading.append(count, kicker);
    shell.append(heading, item);
    if(id === 'job-pipeline' && moreWork) shell.append(moreWork);
    stage.append(shell);
    return stage;
  });
  principles.classList.add('viewport-stage', 'principles-stage');
  about.classList.add('viewport-stage', 'about-stage');
  contact.classList.add('viewport-stage', 'contact-stage');
  contact.append(footer);
  main.replaceChildren(intro, work, ...projects, principles, about, contact);
  const stages = [...main.querySelectorAll('.viewport-stage')];
  document.documentElement.classList.add('presentation-ready');

  const small = window.matchMedia('(max-width: 1023px), (max-height: 649px), (pointer: coarse)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canPage = () => !small.matches;
  let activeIndex = 0;
  let lockUntil = 0;
  let frame = null;
  let scrollFrame = null;

  const stageTop = index => Math.round(stages[index].getBoundingClientRect().top + window.scrollY);
  const closestIndex = () => {
    const y = window.scrollY;
    let best = 0;
    let distance = Infinity;
    stages.forEach((stage, i) => {
      const d = Math.abs(stageTop(i) - y);
      if(d < distance) { distance = d; best = i; }
    });
    return best;
  };
  const rail = make('nav','section-rail', { 'aria-label': 'Portfolio slides' });
  const names = ['Introduction', 'Mobility Control Tower', 'Amazon Reviews', 'Job Data Pipeline', 'Engineering notes', 'About', 'Contact'];
  stages.forEach((stage,i) => {
    const a = make('a','',{href:'#' + stage.id, 'aria-label':names[i] || 'Slide ' + (i+1)});
    a.title = names[i] || 'Slide ' + (i+1);
    const dot = make('span','rail-dot');
    a.append(dot);
    rail.append(a);
  });
  document.body.append(rail);
  const railLinks = [...rail.querySelectorAll('a')];

  function paintNav() {
    railLinks.forEach((link,i) => {
      if(i === activeIndex) link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
    });
  }
  function stop() {
    if(frame !== null) cancelAnimationFrame(frame);
    frame = null;
    document.documentElement.classList.remove('is-section-sliding');
  }
  function navigateTo(index, opts = {}) {
    index = Math.max(0, Math.min(stages.length - 1, index));
    if(index === activeIndex && Math.abs(window.scrollY - stageTop(index)) < 3) return;
    stop();
    activeIndex = index;
    paintNav();
    const target = stageTop(index);
    const start = window.scrollY;
    const diff = target - start;
    if(reduceMotion.matches || !canPage() || opts.instant || Math.abs(diff) < 3) {
      window.scrollTo({top:target,behavior:'instant'});
      lockUntil = performance.now() + 200;
      return;
    }
    const began = performance.now();
    const duration = 780;
    lockUntil = began + duration + 220;
    document.documentElement.classList.add('is-section-sliding');
    const tick = now => {
      const t = Math.min(1,(now-began)/duration);
      const ease = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
      window.scrollTo({top:start+diff*ease,behavior:'instant'});
      if(t<1) frame=requestAnimationFrame(tick);
      else {
        frame=null;
        document.documentElement.classList.remove('is-section-sliding');
        window.scrollTo({top:target,behavior:'instant'});
      }
    };
    frame=requestAnimationFrame(tick);
  }

  function next(direction) {
    if(performance.now() < lockUntil) return;
    navigateTo(activeIndex + direction);
  }
  function internalScroll(target, direction) {
    for(let element = target; element && element !== document.body; element=element.parentElement) {
      if(!(element instanceof HTMLElement)) continue;
      const style = window.getComputedStyle(element);
      if(!['auto','scroll'].includes(style.overflowY) || element.scrollHeight <= element.clientHeight + 3) continue;
      if(direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 3) return true;
      if(direction < 0 && element.scrollTop > 3) return true;
    }
    return false;
  }
  window.addEventListener('wheel',event => {
    if(!canPage() || event.ctrlKey || event.metaKey || !event.deltaY ||
       Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
       internalScroll(event.target, Math.sign(event.deltaY))) return;
    event.preventDefault();
    next(Math.sign(event.deltaY));
  },{passive:false});
  document.addEventListener('keydown',event => {
    if(!canPage() || event.ctrlKey || event.metaKey || event.altKey ||
      event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const backward = ['ArrowUp','PageUp'].includes(event.key);
    const forward = ['ArrowDown','PageDown',' '].includes(event.key);
    if(!backward && !forward && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    if(event.key === 'Home') navigateTo(0);
    else if(event.key === 'End') navigateTo(stages.length-1);
    else next(backward ? -1 : 1);
  });
  document.addEventListener('click',event => {
    const a = event.target.closest('a[href^="#"]');
    if(!a) return;
    const hash = a.getAttribute('href');
    let index = stages.findIndex(stage => '#' + stage.id === hash);
    if(hash === '#top' || hash === '#main') index = 0;
    if(index < 0) return;
    event.preventDefault();
    if(location.hash !== hash) history.pushState(null,'',hash);
    navigateTo(index);
    document.querySelector('.mobile-menu')?.removeAttribute('open');
  });
  window.addEventListener('scroll',() => {
    if(frame !== null || scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame=null;
      const nearest = closestIndex();
      if(nearest !== activeIndex) { activeIndex = nearest; paintNav(); }
    });
  },{passive:true});
  window.addEventListener('resize',() => {
    stop();
    lockUntil = 0;
    activeIndex = closestIndex();
    paintNav();
  });
  window.addEventListener('hashchange', () => {
    const i=stages.findIndex(s => '#' + s.id === location.hash);
    if(i >= 0) navigateTo(i);
    else if(location.hash === '#top') navigateTo(0);
  });
  // Entry from an existing deep link is supported, but older #anchors that
  // refer to content inside a slide also resolve to that slide.
  const hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(hashTarget) {
    const owner = hashTarget.closest('.viewport-stage');
    if(owner) activeIndex = stages.indexOf(owner);
  }
  paintNav();
  if(canPage()) requestAnimationFrame(() => navigateTo(activeIndex, {instant:true}));
})();
