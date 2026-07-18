// js/app.js
/* === INIT === */
migratePjData();
document.getElementById('nav').addEventListener('click',e=>{const ni=e.target.closest('.ni');if(ni&&ni.dataset.p)nav(ni.dataset.p)});
document.getElementById('mbtn').addEventListener('click',()=>{document.getElementById('sb').classList.toggle('-translate-x-full');document.getElementById('sov').classList.toggle('hidden')});
document.getElementById('sov').addEventListener('click',()=>{document.getElementById('sb').classList.add('-translate-x-full');document.getElementById('sov').classList.add('hidden')});
document.getElementById('mclose').addEventListener('click',closeM);
document.getElementById('mover').addEventListener('click',e=>{if(e.target.id==='mover')closeM()});
document.getElementById('thtg').addEventListener('click',()=>{const isLight=document.documentElement.classList.toggle('light');try{localStorage.setItem('crm_theme',isLight?'light':'dark')}catch(e){}});
window.addEventListener('hashchange',handleHash);
handleHash();