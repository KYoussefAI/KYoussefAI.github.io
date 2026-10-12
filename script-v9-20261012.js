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



// Desktop scenes replace one another rather than travelling a page-height.
// Mobile, smaller windows and long-content states use native scrolling.
(() => {
  const sections = ['top', 'work', 'background', 'contact'].map(id => document.getElementById(id));
  if (sections.some(section => !section)) return;
  const desktop = matchMedia('(min-width:1024px) and (min-height:580px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const header = document.querySelector('.site-header');
  const getHeader = () => header?.getBoundingClientRect().height || 78;
  let active = 0, swapping = null, lastEventTime = -1000, accum = 0, lastDirection = 0, lastNavigation = -1000;
  const clamp = (i) => Math.max(0, Math.min(sections.length-1, i));
  const yFor = i => {
    const top = sections[i].getBoundingClientRect().top + scrollY;
    return Math.min(Math.max(0, document.documentElement.scrollHeight-innerHeight),
      Math.max(0, Math.round(i === 0 ? 0 : top-getHeader())));
  };
  const closest = () => {
    let idx = 0, gap = Infinity;
    sections.forEach((_,i) => {
      const distance = Math.abs(yFor(i)-scrollY);
      if(distance < gap){gap=distance;idx=i;}
    });
    return idx;
  };
  const fits = () => desktop.matches && sections.every((section,i) =>
    section.getBoundingClientRect().height <= innerHeight-getHeader()+32 ||
    // The hero can slightly exceed one viewport because of its footer.
    (i===0 && section.getBoundingClientRect().height<=innerHeight+12)
  );
  const jumpTo = index => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior='auto';
    scrollTo({top:yFor(index),behavior:'instant'});
    html.style.scrollBehavior=prev;
  };
  async function go(index, changeHash=false) {
    if(!fits()) return;
    index=clamp(index);
    if (index===active && Math.abs(yFor(index)-scrollY)<3) return;
    if (swapping) {
      try {swapping.skipTransition();} catch {}
      swapping = null;
    }
    active=index;
    if(changeHash) history.pushState(null,'','#'+sections[index].id);
    if (reduce.matches || !document.startViewTransition) {jumpTo(index);return;}
    try {
      const tx = document.startViewTransition(() => jumpTo(index));
      swapping=tx;
      await tx.finished.catch(()=>{});
      if(swapping===tx)swapping=null;
    }catch{jumpTo(index);swapping=null;}
  }
  const innerScrollable = (target,dir) => {
    for(let node=target;node&&node!==document.body;node=node.parentElement){
      if(!(node instanceof HTMLElement))continue;
      const st=getComputedStyle(node);
      if(!['auto','scroll'].includes(st.overflowY) || node.scrollHeight <= node.clientHeight+2)continue;
      if(dir>0 ? node.scrollTop+node.clientHeight<node.scrollHeight-2 : node.scrollTop>2)return true;
    }
    return false;
  };
  addEventListener('wheel',e => {
    if(!fits() || e.ctrlKey || e.metaKey || !e.deltaY ||
      Math.abs(e.deltaX)>Math.abs(e.deltaY) || innerScrollable(e.target,Math.sign(e.deltaY))) return;
    e.preventDefault();
    const now = performance.now(), dir = Math.sign(e.deltaY);
    if(now-lastEventTime>170 || dir!==lastDirection)accum=0;
    lastEventTime=now;lastDirection=dir;
    accum+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
    if(Math.abs(accum)>=24 && now-lastNavigation>=530){
      lastNavigation=now;accum=0;
      go(active+dir);
    }
  },{passive:false});
  document.addEventListener('keydown',e=>{
    if(!fits() || e.altKey || e.ctrlKey || e.metaKey ||
       e.target.closest('input,textarea,select,button,[contenteditable="true"]'))return;
    const dir=['ArrowDown','PageDown',' '].includes(e.key)?1:
      ['ArrowUp','PageUp'].includes(e.key)?-1:0;
    if(dir){e.preventDefault();go(active+dir);}
    else if(e.key==='Home'){e.preventDefault();go(0)}
    else if(e.key==='End'){e.preventDefault();go(3)}
  });
  document.addEventListener('click',e=>{
    if(!fits())return;
    const link=e.target.closest('a[href^="#"]');if(!link)return;
    const hash=link.getAttribute('href');
    const i=sections.findIndex(s=>('#'+s.id)===hash || ((hash==='#main') && s.id==='top'));
    if(i<0)return;
    e.preventDefault();
    go(i,true);
  });
  addEventListener('scroll',()=>{if(!swapping && fits())active=closest();},{passive:true});
  addEventListener('resize',()=>{if(swapping){swapping.skipTransition();swapping=null;} active=closest();},{passive:true});
  addEventListener('hashchange',()=>{
    const i=sections.findIndex(s=>('#'+s.id)===location.hash);
    if(i>=0){if(fits())go(i);else sections[i].scrollIntoView({behavior:'smooth'});}
  });
  const initial=sections.findIndex(s=>('#'+s.id)===location.hash);
  if(initial>=0)active=initial;
})();
