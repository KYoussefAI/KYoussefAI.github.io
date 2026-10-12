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


// Desktop section navigation: one wheel gesture advances a whole section.
// Never change native scrolling on touch screens and constrained viewports.
(() => {
  const desktop = matchMedia('(min-width:1280px) and (min-height:750px) and (pointer:fine)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const stages = ['top','work','background','contact'].map(id => document.getElementById(id)).filter(Boolean);
  if(stages.length !== 4) return;
  let active = 0, raf = 0, lastWheel = -1000, sliding = false;
  const offset = () => document.querySelector('.site-header')?.getBoundingClientRect().height || 78;
  const target = i => Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
    Math.round(stages[i].getBoundingClientRect().top + scrollY - offset())));
  const closest = () => {
    let best = 0, min = Infinity;
    stages.forEach((section,i) => {
      const distance = Math.abs(target(i) - scrollY);
      if(distance < min){min = distance;best = i;}
    });
    return best;
  };
  const cancel = () => { if(raf) cancelAnimationFrame(raf);raf=0;sliding=false; };
  const go = (index, instant = false) => {
    index=Math.max(0,Math.min(stages.length-1,index));
    cancel();
    active=index;
    const from=scrollY,to=target(index),distance=to-from;
    if(instant || reduce.matches || Math.abs(distance)<2){scrollTo({top:to,behavior:'instant'});return;}
    const start=performance.now(),duration=660;
    sliding=true;
    const frame = now => {
      const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3);
      scrollTo({top:from+distance*ease,behavior:'instant'});
      if(t<1)raf=requestAnimationFrame(frame);
      else{scrollTo({top:to,behavior:'instant'});raf=0;sliding=false;}
    };
    raf=requestAnimationFrame(frame);
  };
  const move = dir => go(active+dir);
  const internalScroll = (node,dir) => {
    for(;node && node!==document.body;node=node.parentElement){
      if(!(node instanceof HTMLElement))continue;
      const s=getComputedStyle(node);
      if(!['auto','scroll'].includes(s.overflowY) || node.scrollHeight<=node.clientHeight+3)continue;
      if(dir>0 ? node.scrollTop+node.clientHeight<node.scrollHeight-3 : node.scrollTop>3)return true;
    }
    return false;
  };
  addEventListener('wheel',event=>{
    if(!desktop.matches||event.ctrlKey||event.metaKey||!event.deltaY||
       Math.abs(event.deltaX)>Math.abs(event.deltaY)||
       internalScroll(event.target,Math.sign(event.deltaY)))return;
    event.preventDefault();
    const now=performance.now();
    if(now-lastWheel>180)move(Math.sign(event.deltaY));
    lastWheel=now;
  },{passive:false});
  document.addEventListener('keydown',event=>{
    if(!desktop.matches||event.altKey||event.ctrlKey||event.metaKey||
       event.target.closest('input,textarea,select,button,[contenteditable="true"]'))return;
    const forward=['ArrowDown','PageDown',' '].includes(event.key);
    const back=['ArrowUp','PageUp'].includes(event.key);
    if(forward||back){event.preventDefault();move(forward?1:-1);}
    else if(event.key==='Home'){event.preventDefault();go(0);}
    else if(event.key==='End'){event.preventDefault();go(stages.length-1);}
  });
  document.addEventListener('click',event=>{
    if(!desktop.matches)return;
    const a=event.target.closest('a[href^="#"]');if(!a)return;
    const hash=a.getAttribute('href');
    const i=stages.findIndex(s=>('#'+s.id)===hash||(hash==='#main'&&s.id==='top'));
    if(i<0)return;
    event.preventDefault();
    if(location.hash!==hash)history.pushState(null,'',hash);
    go(i);
  });
  addEventListener('scroll',()=>{if(desktop.matches&&!sliding&&!raf)active=closest();},{passive:true});
  addEventListener('resize',()=>{cancel();active=closest();});
  const initial=stages.findIndex(s=>('#'+s.id)===location.hash);
  if(initial>=0)active=initial;
})();
