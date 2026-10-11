// A deliberate, section-at-a-time portfolio with accessible mobile fallback.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

(() => {
  const main = document.querySelector('main');
  const header = document.querySelector('.site-header');
  if (!main || !header) return;
  const $ = selector => document.querySelector(selector);
  const hero = $('.hero'), band = $('.statement-band'), work = $('#work');
  const principles = $('#principles'), about = $('#about'), contact = $('#contact');
  const footer = $('.site-footer');
  const workShell = work?.querySelector('.shell');
  const grid = workShell?.querySelector('.secondary-grid');
  const cards = grid ? [...grid.children] : [];
  const other = workShell?.querySelector('.more-work');
  if (!hero || !band || !work || !principles || !about || !contact || !footer || cards.length !== 2) return;

  const element = (tag, classes, attrs = {}) => {
    const node = document.createElement(tag);
    node.className = classes;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const intro = element('section', 'viewport-stage intro-stage', {id: 'intro', 'aria-label': 'Introduction'});
  intro.append(hero, band);
  work.classList.add('viewport-stage', 'featured-stage');
  grid.remove();
  other?.remove();
  const project = (id, title, subtitle, label, card, extra) => {
    const slide = element('section', 'viewport-stage single-project-stage', {id, 'aria-label': title});
    const shell = element('div', 'shell single-project-shell');
    const heading = element('div', 'single-project-heading');
    const kicker = element('span', 'section-number');
    kicker.textContent = label;
    const headingTitle = element('h2', 'slide-title');
    headingTitle.textContent = subtitle;
    heading.append(kicker, headingTitle);
    shell.append(heading, card);
    if (extra) shell.append(extra);
    slide.append(shell);
    return slide;
  };
  const amazon = project('amazon', 'Amazon Reviews', 'Streaming data, measured.', '02 / STREAMING SYSTEM', cards[0]);
  const jobs = project('job-pipeline', 'French Job Market', 'Meaning before metrics.', '03 / DATA PIPELINE', cards[1], other);
  principles.classList.add('viewport-stage', 'principles-stage');
  about.classList.add('viewport-stage', 'about-stage');
  contact.classList.add('viewport-stage', 'contact-stage');
  contact.append(footer);
  main.replaceChildren(intro, work, amazon, jobs, principles, about, contact);
  document.documentElement.classList.add('presentation-ready');

  const slides = [...main.querySelectorAll('.viewport-stage')];
  const labels = ['Introduction', 'Mobility Control Tower', 'Amazon Reviews', 'French Job Market', 'Engineering notes', 'About', 'Contact'];
  const rail = element('nav', 'section-rail', {'aria-label':'Jump to a slide'});
  const railLinks = slides.map((slide, index) => {
    const link = element('a', '', {href:'#'+slide.id, title:labels[index], 'aria-label':labels[index]});
    link.append(element('span', 'rail-dot'));
    rail.append(link);
    return link;
  });
  document.body.append(rail);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageMode = window.matchMedia('(min-width: 1024px) and (min-height: 700px) and (pointer: fine)');
  let selected = 0, animation = 0, scrollTick = 0, lastWheel = -1000;
  const yOf = index => Math.round(slides[index].getBoundingClientRect().top + scrollY);
  const nearest = () => {
    let result = 0, distance = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(yOf(i) - scrollY);
      if (d < distance) { distance = d; result = i; }
    });
    return result;
  };
  const updateRail = () => railLinks.forEach((link, i) => {
    if (i === selected) link.setAttribute('aria-current','step');
    else link.removeAttribute('aria-current');
  });
  const cancel = () => {
    if (animation) cancelAnimationFrame(animation);
    animation = 0;
  };
  const go = (index, instant = false) => {
    index = Math.max(0, Math.min(slides.length-1, index));
    cancel();
    selected = index;
    updateRail();
    const target = yOf(index), from = scrollY;
    if (instant || !pageMode.matches || reducedMotion.matches || Math.abs(target-from)<2) {
      scrollTo({top:target,behavior:'instant'});
      return;
    }
    const started = performance.now(), duration = 600, distance = target-from;
    const animate = now => {
      const p = Math.min(1,(now-started)/duration);
      const eased = 1-Math.pow(1-p,3);
      scrollTo({top:from+distance*eased,behavior:'instant'});
      if(p<1) animation=requestAnimationFrame(animate);
      else {animation=0; scrollTo({top:target,behavior:'instant'});}
    };
    animation=requestAnimationFrame(animate);
  };
  const move = direction => go(selected+direction);
  const wheelSafe = (target, direction) => {
    for (let node=target; node && node !== document.body; node=node.parentElement) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      if (!['auto','scroll'].includes(style.overflowY) || node.scrollHeight <= node.clientHeight+2) continue;
      if (direction>0 ? node.scrollTop+node.clientHeight<node.scrollHeight-2 : node.scrollTop>2) return true;
    }
    return false;
  };
  window.addEventListener('wheel', event => {
    if (!pageMode.matches || event.ctrlKey || event.metaKey || !event.deltaY ||
        Math.abs(event.deltaX)>Math.abs(event.deltaY) || wheelSafe(event.target,Math.sign(event.deltaY))) return;
    event.preventDefault();
    const now=performance.now();
    // Group inertia / wheel events into one gesture. A new deliberate gesture,
    // even during animation, immediately advances instead of being discarded.
    const newGesture = now-lastWheel > 180;
    lastWheel=now;
    if (newGesture) move(Math.sign(event.deltaY));
  },{passive:false});
  document.addEventListener('keydown', event => {
    if (!pageMode.matches || event.ctrlKey || event.altKey || event.metaKey ||
        event.target.closest('input,textarea,select,button,[contenteditable="true"]')) return;
    if (['ArrowDown','PageDown',' '].includes(event.key)) {event.preventDefault();move(1);}
    else if (['ArrowUp','PageUp'].includes(event.key)) {event.preventDefault();move(-1);}
    else if (event.key==='Home') {event.preventDefault();go(0);}
    else if (event.key==='End') {event.preventDefault();go(slides.length-1);}
  });
  document.addEventListener('click',event => {
    const link=event.target.closest('a[href^="#"]');
    if(!link) return;
    const hash=link.getAttribute('href');
    const target=(hash==='#top'||hash==='#main') ? slides[0] : $(hash);
    if(!target) return;
    const slide=target.closest('.viewport-stage');
    if(!slide) return;
    event.preventDefault();
    if(location.hash!==hash) history.pushState(null,'',hash);
    go(slides.indexOf(slide));
    $('.mobile-menu')?.removeAttribute('open');
  });
  window.addEventListener('hashchange', () => {
    const node=document.getElementById(location.hash.slice(1));
    const slide=node?.closest('.viewport-stage');
    if(slide) go(slides.indexOf(slide));
    else if(location.hash==='#top') go(0);
  });
  window.addEventListener('scroll',() => {
    if(animation || scrollTick) return;
    scrollTick=requestAnimationFrame(() => {
      scrollTick=0;
      const index=nearest();
      if(index!==selected) {selected=index;updateRail();}
    });
  },{passive:true});
  window.addEventListener('resize',() => {cancel();selected=nearest();updateRail();});
  const initial=document.getElementById(decodeURIComponent(location.hash.slice(1)))?.closest('.viewport-stage');
  if(initial) selected=slides.indexOf(initial);
  updateRail();
  requestAnimationFrame(() => { if(pageMode.matches) go(selected,true); });
})();
