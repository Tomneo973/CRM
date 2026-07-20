/* === INIT === */
migratePjData();
document.getElementById('nav').addEventListener('click',e=>{const ni=e.target.closest('.ni');if(ni&&ni.dataset.p)nav(ni.dataset.p)});
document.getElementById('mbtn').addEventListener('click',()=>{document.getElementById('sb').classList.toggle('-translate-x-full');document.getElementById('sov').classList.toggle('hidden')});
document.getElementById('sov').addEventListener('click',()=>{document.getElementById('sb').classList.add('-translate-x-full');document.getElementById('sov').classList.add('hidden')});
document.getElementById('mclose').addEventListener('click',closeM);
document.getElementById('mover').addEventListener('click',e=>{if(e.target.id==='mover')closeM()});
document.getElementById('thtg').addEventListener('click',()=>{const isLight=document.documentElement.classList.toggle('light');try{localStorage.setItem('crm_theme',isLight?'light':'dark')}catch(e){}});
const gsInput=document.getElementById('gsinput');
if(gsInput){
  gsInput.addEventListener('input',e=>gsRender(e.target.value));
  gsInput.addEventListener('focus',e=>{if(e.target.value.trim())gsRender(e.target.value)});
  document.addEventListener('click',e=>{if(!e.target.closest('.gsw'))gsClose()});
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&document.activeElement!==gsInput&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();gsInput.focus()}
    if(e.key==='Escape')gsClose();
  });
}
window.addEventListener('hashchange',handleHash);
handleHash();
