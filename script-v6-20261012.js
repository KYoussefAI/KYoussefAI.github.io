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



// Reliable full-section desktop sliding, including laptops with short viewports.
(() => {
 const mode=matchMedia('(min-width:1024px) and (min-height:550px)');
 const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
 const nodes=['top','work','background','contact'].map(id=>document.getElementById(id));
 if(nodes.some(el=>!el))return;
 let active=0,frame=0,animating=false,lastWheelTime=-1e5,lastDirection=0;
 const headerHeight=()=>document.querySelector('.site-header')?.getBoundingClientRect().height||78;
 const yTarget=i=>{
   const maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   return Math.min(maxY,Math.max(0,Math.round(nodes[i].getBoundingClientRect().top+scrollY-headerHeight())));
 };
 function nearest(){
   let idx=0,dist=Infinity;
   nodes.forEach((node,i)=>{const d=Math.abs(yTarget(i)-scrollY);if(d<dist){idx=i;dist=d;}});
   return idx;
 }
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;animating=false;}
 function navigate(index,instantly=false){
   index=Math.max(0,Math.min(nodes.length-1,index));stop();active=index;
   const begin=scrollY,goal=yTarget(index),diff=goal-begin;
   if(instantly||reduceMotion.matches||Math.abs(diff)<2){scrollTo({top:goal,behavior:'instant'});return;}
   animating=true;
   const start=performance.now(),duration=650;
   function tick(now){
     const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3);
     scrollTo({top:begin+diff*ease,behavior:'instant'});
     if(t<1)frame=requestAnimationFrame(tick);
     else{frame=0;animating=false;scrollTo({top:goal,behavior:'instant'});}
   }
   frame=requestAnimationFrame(tick);
 }
 function innerScrollable(node,d){
   for(let el=node;el&&el!==document.body;el=el.parentElement){
     if(!(el instanceof HTMLElement))continue;
     const overflow=getComputedStyle(el).overflowY;
     if(!['auto','scroll'].includes(overflow)||el.scrollHeight<=el.clientHeight+3)continue;
     if(d>0?el.scrollTop+el.clientHeight<el.scrollHeight-2:el.scrollTop>2)return true;
   }
   return false;
 }
 addEventListener('wheel',ev=>{
   if(!mode.matches||ev.ctrlKey||ev.metaKey||!ev.deltaY||
     Math.abs(ev.deltaX)>Math.abs(ev.deltaY)||innerScrollable(ev.target,Math.sign(ev.deltaY)))return;
   ev.preventDefault();
   const now=performance.now(),dir=Math.sign(ev.deltaY),gap=now-lastWheelTime;
   const freshSwipe=gap>155||dir!==lastDirection;
   lastWheelTime=now;lastDirection=dir;
   if(freshSwipe)navigate(active+dir);
 },{passive:false});
 document.addEventListener('keydown',ev=>{
   if(!mode.matches||ev.altKey||ev.ctrlKey||ev.metaKey||
     ev.target.closest('input,textarea,select,button,[contenteditable="true"]'))return;
   let dir=0;
   if(['ArrowDown','PageDown',' '].includes(ev.key))dir=1;
   else if(['ArrowUp','PageUp'].includes(ev.key))dir=-1;
   if(dir){ev.preventDefault();navigate(active+dir);}
   else if(ev.key==='Home'){ev.preventDefault();navigate(0);}
   else if(ev.key==='End'){ev.preventDefault();navigate(nodes.length-1);}
 });
 document.addEventListener('click',ev=>{
   if(!mode.matches)return;
   const a=ev.target.closest('a[href^="#"]');if(!a)return;
   const hash=a.getAttribute('href');
   const i=nodes.findIndex(el=>'#'+el.id===hash||((hash==='#main'||hash==='#top')&&el.id==='top'));
   if(i<0)return;
   ev.preventDefault();
   if(location.hash!==hash)history.pushState(null,'',hash);
   navigate(i);
 });
 addEventListener('scroll',()=>{if(mode.matches&&!animating&&!frame)active=nearest();},{passive:true});
 addEventListener('resize',()=>{stop();active=nearest();},{passive:true});
 const i=nodes.findIndex(el=>'#'+el.id===location.hash);
 if(i>=0)active=i;
})();
