// js/core/router.js
/* Navigation */
let pg='dashboard',pp={};
function nav(p,params){pg=p;pp=params||{};window.location.hash=p+(pp.id?'/'+pp.id:'');render()}
function showA(){document.getElementById('app').style.display='';document.getElementById('portal').style.display='none';document.body.style.background='';document.body.style.color=''}
function showP(h){document.getElementById('app').style.display='none';const p=document.getElementById('portal');p.innerHTML=h;p.style.display='';document.body.style.background='#f8f7f4';document.body.style.color='#1a1a1a'}

function handleHash(){
  const h=window.location.hash.slice(1)||'dashboard';
  if(h.startsWith('val=')){renderCVal(h.split('val=')[1]);return}
  if(h.startsWith('sign=')){renderCSig(h.split('sign=')[1]);return}
  if(h.startsWith('resp=')){importVResp(h.split('resp=')[1]);return}
  if(h.startsWith('sigresp=')){importSResp(h.split('sigresp=')[1]);return}
  const parts=h.split('/');pg=parts[0];pp=parts[1]?{id:parts[1]}:{};render();
}

function render(){
  showA();
  document.querySelectorAll('.ni').forEach(n=>n.classList.toggle('on',n.dataset.p===pg));
  const tl={dashboard:'Tableau de bord',clients:'Clients',devis:'Devis',factures:'Factures',projets:'Projets',signature:'Signatures',parametres:'Parametres',achats:'Achats',bilan:'Bilan annuel'};
  document.getElementById('ptitle').textContent=tl[pg]||'';
  const C=document.getElementById('ct');
  const fn={dashboard:rDash,clients:pp.id?rClV:rCl,devis:pp.id?rDvV:rDv,factures:pp.id?rFcV:rFc,projets:pp.id?rPjV:rPj,signature:rSig,parametres:rPar,achats:rAc,bilan:pp.id?rBilV:rBil};
  (fn[pg]||rDash)(C,pp.id);
  let t=0;for(let k in localStorage)t+=localStorage[k].length*2;
  document.getElementById('ssize').textContent=(t/1024).toFixed(1)+' Ko';
  updSi();
}

/* Confirm */
function cfm(title,msg,fn){showM(title,'<p class="text-muted">'+msg+'</p><div class="flex gap-3 mt-6 justify-end"><button class="b bs" onclick="closeM()">Annuler</button><button class="b bd" onclick="closeM();('+fn.toString()+')()">Confirmer</button></div>')}

/* Filter table */
function ft(cls,q){q=q.toLowerCase();document.querySelectorAll('.'+cls).forEach(r=>r.style.display=r.dataset.s.includes(q)?'':'none')}