const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
},{threshold:.13});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const progressBar=document.getElementById('progressBar');
window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progressBar.style.width=(max>0?(window.scrollY/max)*100:0)+'%';
},{passive:true});

const menuToggle=document.getElementById('menuToggle');
const nav=document.getElementById('nav');
menuToggle.addEventListener('click',()=>nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const song=document.getElementById('song');
const musicToggle=document.getElementById('musicToggle');
const musicLabel=document.getElementById('musicLabel');
const toast=document.getElementById('toast');
let toastTimer;
function showToast(){toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500)}
musicToggle.addEventListener('click',async()=>{
  if(song.paused){
    try{await song.play();musicToggle.classList.add('playing');musicLabel.textContent='الأغنية شغّالة';}
    catch(e){showToast();}
  }else{song.pause();musicToggle.classList.remove('playing');musicLabel.textContent='أغنية بحبها.. بتفكرني بيكي';}
});
song.addEventListener('error',showToast);
song.addEventListener('play',()=>{musicToggle.classList.add('playing');musicLabel.textContent='أغنية بحبها.. بتفكرني بيكي';});
song.addEventListener('pause',()=>{musicToggle.classList.remove('playing');musicLabel.textContent='أغنية بحبها.. بتفكرني بيكي';});

// نحاول تشغيلها فور فتح الصفحة؛ بعض المتصفحات تمنع الصوت التلقائي
// لذلك نعيد المحاولة عند أول تفاعل من الزائرة.
async function tryAutoplay(){
  try{await song.play();musicToggle.classList.add('playing');}
  catch(e){/* المتصفح قد يشترط تفاعلًا أولًا */}
}
window.addEventListener('load',tryAutoplay);
['pointerdown','keydown','touchstart'].forEach(eventName=>{
  document.addEventListener(eventName,()=>{
    if(song.paused) tryAutoplay();
  },{once:true,passive:true});
});

// كروت الجرة: اضغطي مرة لفتح الكارت ومرة أخرى لإغلاقه.
document.querySelectorAll('.jar-card').forEach(card=>{
  card.addEventListener('click',()=>card.classList.toggle('flipped'));
});
song.addEventListener('ended',()=>{song.currentTime=0;song.play().catch(()=>{});});

const track=document.getElementById('filmTrack');
document.getElementById('filmNext').addEventListener('click',()=>track.scrollBy({left:-300,behavior:'smooth'}));
document.getElementById('filmPrev').addEventListener('click',()=>track.scrollBy({left:300,behavior:'smooth'}));
document.querySelectorAll('.film-photo img').forEach(img=>img.addEventListener('click',()=>{
  const overlay=document.createElement('div');
  overlay.className='image-viewer';
  overlay.innerHTML=`<button aria-label="إغلاق">×</button><img src="${img.src}" alt="${img.alt}">`;
  Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'100',background:'#1f1713ed',display:'grid',placeItems:'center',padding:'25px',opacity:'0',transition:'opacity .3s'});
  const big=overlay.querySelector('img');
  Object.assign(big.style,{maxWidth:'min(90vw,900px)',maxHeight:'85vh',objectFit:'contain',boxShadow:'0 20px 60px #0008',transform:'scale(.94)',transition:'transform .3s'});
  const close=overlay.querySelector('button');
  Object.assign(close.style,{position:'absolute',top:'20px',left:'25px',border:'1px solid #d9c6ad',background:'transparent',color:'#fff',width:'42px',height:'42px',borderRadius:'50%',fontSize:'25px',cursor:'pointer'});
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>{overlay.style.opacity='1';big.style.transform='scale(1)'});
  const remove=()=>{overlay.style.opacity='0';setTimeout(()=>overlay.remove(),300)};
  close.addEventListener('click',remove);overlay.addEventListener('click',e=>{if(e.target===overlay)remove()});
  document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){remove();document.removeEventListener('keydown',esc)}});
}));


// تحريك شريط الصور تلقائيًا، مع إيقافه عند مرور المؤشر أو لمس الشريط.
let filmPaused=false;
let filmDirection=-1;
const pauseFilm=()=>{filmPaused=true};
const resumeFilm=()=>{filmPaused=false};
track.addEventListener('mouseenter',pauseFilm);
track.addEventListener('mouseleave',resumeFilm);
track.addEventListener('touchstart',pauseFilm,{passive:true});
track.addEventListener('touchend',()=>setTimeout(resumeFilm,1800),{passive:true});
track.addEventListener('wheel',pauseFilm,{passive:true});
let lastFilmFrame=0;
function animateFilm(now){
  if(!lastFilmFrame) lastFilmFrame=now;
  const delta=Math.min(now-lastFilmFrame,40);
  lastFilmFrame=now;
  if(!filmPaused && track.scrollWidth>track.clientWidth){
    track.scrollLeft += filmDirection * delta * 0.035;
    if(track.scrollLeft<=0) filmDirection=1;
    if(track.scrollLeft>=track.scrollWidth-track.clientWidth-1) filmDirection=-1;
  }
  requestAnimationFrame(animateFilm);
}
requestAnimationFrame(animateFilm);
