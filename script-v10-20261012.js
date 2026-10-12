(()=>{
const root=document.documentElement,slides=['top','work','background','contact'].map(id=>document.getElementById(id)),progress=document.getElementById('scroll-progress'),bar=progress?.parentElement,footer=document.querySelector('body>footer'),nav=[...document.querySelectorAll('.nav-links a')],mode=matchMedia('(min-width:1024px) and (min-height:600px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
if(slides.some(s=>!s))return;
document.getElementById('year').textContent=new Date().getFullYear();
let active=Math.max(0,slides.findIndex(s=>'#'+s.id===location.hash)),phase=false,lastWheel=0,lastDirection=0,queued=null,gesture=0,timerA=0,timerB=0;
const clamp=x=>Math.max(0,Math.min(slides.length-1,x));
function indicator(){
 if(progress)progress.style.transform='scaleX('+((active+1)/slides.length)+')';
 bar?.setAttribute('aria-valuenow',String(active+1));
 nav.forEach(a=>a.getAttribute('href')==='#'+slides[active].id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
 footer?.classList.toggle('scene-footer-visible',root.classList.contains('scene-mode')&&active===3);
}
function show(i,enter){
 active=clamp(i);
 slides.forEach((s,k)=>{
  const on=k===active;
  s.classList.toggle('is-active',on);s.classList.remove('is-exiting');s.classList.toggle('will-enter',on&&enter&&!reduce.matches);
  s.inert=!on;on?s.removeAttribute('aria-hidden'):s.setAttribute('aria-hidden','true');
  if(on)s.scrollTop=0;
 });
 indicator();
 if(enter&&!reduce.matches)requestAnimationFrame(()=>requestAnimationFrame(()=>slides[active].classList.remove('will-enter')));
}
function go(i,hash=false){
 i=clamp(i);
 if(hash&&location.hash!=='#'+slides[i].id)history.pushState(null,'','#'+slides[i].id);
 if(phase){queued=i;return;}
 if(i===active)return;
 phase=true;slides[active].classList.add('is-exiting');
 timerA=setTimeout(()=>{
  show(i,true);
  timerB=setTimeout(()=>{
   phase=false;
   if(queued!==null){const next=queued;queued=null;if(next!==active)go(next)}
  },reduce.matches?0:560);
 },reduce.matches?0:255);
}
function init(){
 clearTimeout(timerA);clearTimeout(timerB);phase=false;queued=null;
 const enabled=mode.matches;
 root.classList.toggle('scene-mode',enabled);
 if(enabled){
  root.style.scrollBehavior='auto';
  window.scrollTo({top:0,behavior:'instant'});
  show(active,false);
 } else {
  root.style.removeProperty('scroll-behavior');
  slides.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');s.classList.remove('is-active','is-exiting','will-enter')});
  footer?.classList.remove('scene-footer-visible');nativeProgress();
 }
}
function nativeProgress(){
 if(root.classList.contains('scene-mode'))return;
 const max=Math.max(1,root.scrollHeight-innerHeight);
 if(progress)progress.style.transform='scaleX('+Math.max(0,Math.min(1,scrollY/max))+')';
}
addEventListener('wheel',e=>{
 if(!root.classList.contains('scene-mode')||e.ctrlKey||e.metaKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const section=slides[active],dir=Math.sign(e.deltaY);
 if(section.scrollHeight>section.clientHeight+8&&(dir>0?section.scrollTop+section.clientHeight<section.scrollHeight-3:section.scrollTop>3))return;
 e.preventDefault();
 const now=performance.now();
 if(now-lastWheel>220||dir!==lastDirection)gesture=0;
 lastWheel=now;lastDirection=dir;
 gesture+=Math.abs(e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
 if(gesture>=25&&!phase){gesture=0;go(active+dir)}
},{passive:false});
document.addEventListener('keydown',e=>{
 if(!root.classList.contains('scene-mode')||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,button,[contenteditable="true"]'))return;
 const dir=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;
 if(dir){e.preventDefault();go((queued??active)+dir)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(3)}
});
document.addEventListener('click',e=>{
 if(!root.classList.contains('scene-mode'))return;
 const a=e.target.closest('a[href^="#"]');if(!a)return;
 const href=a.getAttribute('href'),i=slides.findIndex(s=>href==='#'+s.id||(href==='#main'&&s.id==='top'));
 if(i<0)return;e.preventDefault();go(i,true);
});
addEventListener('popstate',()=>{const i=slides.findIndex(s=>'#'+s.id===location.hash);if(i>=0&&root.classList.contains('scene-mode'))go(i)});
addEventListener('scroll',nativeProgress,{passive:true});
mode.addEventListener('change',init);
init();
})();