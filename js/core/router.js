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

/* Detection automatique des factures en retard / partiellement payees.
   Ne touche jamais brouillon/refuse, et ne retrograde pas une facture deja payee. */
function autoUpdateFacturesStatut(){
  const a=gd(K.fc);let changed=false;
  const today=td();
  const b=a.map(f=>{
    if(f.statut==='brouillon')return f;
    const paye=totalPaye(f),total=f.totalTTC||0;
    let statut=f.statut;
    if(paye>=total&&total>0)statut='payee';
    else if(paye>0)statut='partiel';
    else if(f.dateEcheance&&f.dateEcheance<today&&(f.statut==='envoyee'||f.statut==='retard'))statut='retard';
    else if(f.statut==='retard'&&(!f.dateEcheance||f.dateEcheance>=today))statut='envoyee';
    if(statut!==f.statut){changed=true;return{...f,statut}}
    return f;
  });
  if(changed)sd(K.fc,b);
}

function render(){
  showA();
  autoUpdateFacturesStatut();
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

/* === RECHERCHE GLOBALE === */
function globalSearchResults(q){
  q=(q||'').toLowerCase().trim();
  if(!q)return[];
  const cl=gd(K.cl),dv=gd(K.dv),fc=gd(K.fc),ac=gd(K.ac),pj=gd(K.pj);
  const res=[];
  cl.filter(c=>(c.nom+' '+(c.entreprise||'')+' '+(c.email||'')).toLowerCase().includes(q)).slice(0,6).forEach(c=>res.push({cat:'Clients',label:c.nom+(c.entreprise?' - '+c.entreprise:''),icon:'fa-user',go:()=>nav('clients',{id:c.id})}));
  dv.filter(d=>{const c=cl.find(x=>x.id===d.clientId);return(d.numero+' '+(c?.nom||'')).toLowerCase().includes(q)}).slice(0,6).forEach(d=>{const c=cl.find(x=>x.id===d.clientId);res.push({cat:'Devis',label:d.numero+' - '+(c?.nom||'-'),icon:'fa-file-invoice',go:()=>nav('devis',{id:d.id})})});
  fc.filter(f=>{const c=cl.find(x=>x.id===f.clientId);return(f.numero+' '+(c?.nom||'')).toLowerCase().includes(q)}).slice(0,6).forEach(f=>{const c=cl.find(x=>x.id===f.clientId);res.push({cat:'Factures',label:f.numero+' - '+(c?.nom||'-'),icon:'fa-file-invoice-dollar',go:()=>nav('factures',{id:f.id})})});
  ac.filter(x=>(x.libelle||'').toLowerCase().includes(q)).slice(0,6).forEach(x=>res.push({cat:'Achats',label:x.libelle+' - '+fm(x.montant),icon:'fa-cart-shopping',go:()=>nav('achats')}));
  pj.filter(p=>{const c=cl.find(x=>x.id===p.clientId);return(p.nom+' '+(c?.nom||'')).toLowerCase().includes(q)}).slice(0,6).forEach(p=>res.push({cat:'Projets',label:p.nom,icon:'fa-diagram-project',go:()=>nav('projets',{id:p.id})}));
  return res;
}
function gsRender(q){
  const box=document.getElementById('gsres');if(!box)return;
  const res=globalSearchResults(q);
  if(!q.trim()){box.style.display='none';box.innerHTML='';return}
  if(!res.length){box.innerHTML='<div class="gsr-item text-muted">Aucun resultat</div>';box.style.display='block';return}
  const byCat={};res.forEach(r=>{(byCat[r.cat]=byCat[r.cat]||[]).push(r)});
  box.innerHTML=Object.entries(byCat).map(([cat,items])=>'<div class="gsr-cat">'+cat+'</div>'+items.map((r,i)=>'<div class="gsr-item" data-gi="'+cat+'_'+i+'"><i class="fas '+r.icon+' text-muted mr-2"></i>'+r.label+'</div>').join('')).join('');
  box.style.display='block';
  window._gsMap={};Object.entries(byCat).forEach(([cat,items])=>items.forEach((r,i)=>window._gsMap[cat+'_'+i]=r));
  box.querySelectorAll('[data-gi]').forEach(el=>el.onclick=()=>{const r=window._gsMap[el.dataset.gi];if(r){gsClose();r.go()}});
}
function gsClose(){const box=document.getElementById('gsres');if(box){box.style.display='none';box.innerHTML=''}const inp=document.getElementById('gsinput');if(inp)inp.value=''}
