/* === PROJETS (fusion retroplanning + validation) === */
const pjStL = { en_attente: 'A valider', en_cours: 'En cours', valide: 'Valide', rejete: 'Rejete' };
const pjStB = { en_attente: 'bw', en_cours: 'bi', valide: 'bo', rejete: 'bk' };
const pjStC = {
  en_attente: 'background:rgba(107,112,137,.15);border:1px solid rgba(107,112,137,.3);color:#6B7089',
  en_cours: 'background:rgba(52,152,219,.15);border:1px solid rgba(52,152,219,.3);color:#3498DB',
  valide: 'background:rgba(46,204,113,.15);border:1px solid rgba(46,204,113,.3);color:#2ECC71',
  rejete: 'background:rgba(231,76,60,.15);border:1px solid rgba(231,76,60,.3);color:#E74C3C'
};

function pjStats(p){
  const t=p.etapes.length;
  const va=p.etapes.filter(e=>e.statut==='valide').length;
  const at=p.etapes.filter(e=>e.statut==='en_attente').length;
  const ec=p.etapes.filter(e=>e.statut==='en_cours').length;
  const re=p.etapes.filter(e=>e.statut==='rejete').length;
  return {t,va,at,ec,re,pc:t?Math.round(va/t*100):0};
}

/* --- Migration depuis les anciennes donnees retroplanning (crm_rt) + validation (crm_vl) --- */
function migratePjData(){
  const rt=gd(K.rt), vl=gd(K.vl);
  if(!rt.length && !vl.length) return;
  let pj=gd(K.pj);
  const doneRt=new Set(pj.filter(p=>p._fromRt).map(p=>p._fromRt));
  const doneVl=new Set(pj.flatMap(p=>p._fromVl||[]));
  const usedVl=new Set();
  let changed=false;
  rt.forEach(r=>{
    if(doneRt.has(r.id))return;
    const etapes=(r.etapes||[]).map(e=>({
      id:uid(), nom:e.nom||'', description:'', dateDebut:e.dateDebut||'', dateFin:e.dateFin||'',
      statut:e.statut==='termine'?'valide':(e.statut==='en_cours'?'en_cours':'en_attente'),
      validePar:'', dateValidation:''
    }));
    const match=vl.find(v=>!usedVl.has(v.id) && !doneVl.has(v.id) && v.clientId===r.clientId && v.projetNom && r.nom && v.projetNom.toLowerCase()===r.nom.toLowerCase());
    if(match){
      usedVl.add(match.id);
      (match.points||[]).forEach(pt=>{
        const em=etapes.find(e=>e.nom.toLowerCase()===(pt.titre||'').toLowerCase());
        const st=pt.statut==='valide'?'valide':(pt.statut==='rejete'?'rejete':null);
        if(em){
          em.description=pt.description||'';
          if(st)em.statut=st;
          em.validePar=pt.validePar||'';
          em.dateValidation=pt.dateValidation||'';
        }else{
          etapes.push({id:uid(),nom:pt.titre||'',description:pt.description||'',dateDebut:'',dateFin:'',statut:st||'en_attente',validePar:pt.validePar||'',dateValidation:pt.dateValidation||''});
        }
      });
    }
    pj.push({id:uid(),nom:r.nom||'Projet',clientId:r.clientId,etapes,_fromRt:r.id,_fromVl:match?[match.id]:[]});
    changed=true;
  });
  vl.forEach(v=>{
    if(doneVl.has(v.id) || usedVl.has(v.id))return;
    pj.push({
      id:uid(), nom:v.projetNom||'Projet', clientId:v.clientId,
      etapes:(v.points||[]).map(pt=>({
        id:uid(), nom:pt.titre||'', description:pt.description||'', dateDebut:'', dateFin:'',
        statut:pt.statut==='valide'?'valide':(pt.statut==='rejete'?'rejete':'en_attente'),
        validePar:pt.validePar||'', dateValidation:pt.dateValidation||''
      })),
      _fromVl:[v.id]
    });
    changed=true;
  });
  if(changed) sd(K.pj, pj);
}

/* --- Liste --- */
function rPj(C){
  const a=gd(K.pj), cl=gd(K.cl);
  C.innerHTML='<div class="flex items-center justify-between mb-6"><span class="text-muted text-sm">'+a.length+' projet(s)</span><button class="b bp" onclick="rPjF()"><i class="fas fa-plus"></i> Nouveau projet</button></div>'
    +(a.length?'<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">'+a.map(p=>{
      const c=cl.find(x=>x.id===p.clientId);
      const s=pjStats(p);
      return '<div class="cd cursor-pointer hover:border-accent/30 transition-colors" onclick="nav(\'projets\',{id:\''+p.id+'\'})">'
        +'<div class="flex items-center justify-between mb-3"><h3 class="font-semibold">'+p.nom+'</h3><button class="b bd sm" onclick="event.stopPropagation();cfm(\'Supprimer ?\',\'\',function(){sd(K.pj,gd(K.pj).filter(x=>x.id!==\''+p.id+'\'));toast(\'Supprime\',\'success\');render()})"><i class="fas fa-trash"></i></button></div>'
        +'<div class="text-sm text-muted mb-3"><i class="fas fa-user mr-2"></i>'+(c?.nom||'-')+'<br><i class="fas fa-list-check mr-2"></i>'+s.t+' etape(s)</div>'
        +'<div class="w-full bg-surface2 rounded-full h-2 mb-2"><div class="bg-accent h-2 rounded-full" style="width:'+s.pc+'%"></div></div>'
        +'<div class="flex flex-wrap gap-1">'
          +(s.at?'<span class="badge '+pjStB.en_attente+'">'+s.at+' a valider</span>':'')
          +(s.ec?'<span class="badge '+pjStB.en_cours+'">'+s.ec+' en cours</span>':'')
          +(s.va?'<span class="badge '+pjStB.valide+'">'+s.va+' valide(s)</span>':'')
          +(s.re?'<span class="badge '+pjStB.rejete+'">'+s.re+' rejete(s)</span>':'')
        +'</div></div>';
    }).join('')+'</div>':'<div class="cd es"><i class="fas fa-diagram-project block"></i>Aucun projet. Creez-en un pour planifier des etapes et les faire valider par vos clients.</div>');
}

/* --- Formulaire creation/edition --- */
function pjEtH(e,i){
  return '<div class="p-4 bg-surface2 rounded-lg per" data-i="'+i+'">'
    +'<input type="hidden" name="eid'+i+'" value="'+(e.id||'')+'">'
    +'<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3"><input class="ip" name="en'+i+'" placeholder="Nom de l\'etape" required value="'+(e.nom||'').replace(/"/g,'&quot;')+'"><input class="ip" name="ede'+i+'" placeholder="Description (optionnel)" value="'+(e.description||'').replace(/"/g,'&quot;')+'"></div>'
    +'<div class="grid grid-cols-1 md:grid-cols-3 gap-3"><input class="ip" name="ed'+i+'" type="date" value="'+(e.dateDebut||'')+'"><input class="ip" name="ef'+i+'" type="date" value="'+(e.dateFin||'')+'"><select class="ip" name="es'+i+'">'
      +'<option value="en_attente" '+(e.statut==='en_attente'?'selected':'')+'>A valider</option>'
      +'<option value="en_cours" '+(e.statut==='en_cours'?'selected':'')+'>En cours</option>'
      +'<option value="valide" '+(e.statut==='valide'?'selected':'')+'>Valide</option>'
      +'<option value="rejete" '+(e.statut==='rejete'?'selected':'')+'>Rejete</option>'
    +'</select></div>'
    +'<button type="button" class="b bd sm mt-2" onclick="this.closest(\'.per\').remove()"><i class="fas fa-times"></i> Supprimer</button>'
  +'</div>';
}
function addPjEt(){
  const c=document.getElementById('pec');
  c.insertAdjacentHTML('beforeend', pjEtH({id:'',nom:'',description:'',dateDebut:'',dateFin:'',statut:'en_attente'}, c.children.length));
}
function rPjF(id){
  const p=id?gd(K.pj).find(x=>x.id===id):null;
  const cl=gd(K.cl);
  document.getElementById('ptitle').textContent = p?'Modifier le projet':'Nouveau projet';
  const C=document.getElementById('ct');
  const et = p && p.etapes.length ? p.etapes : [{id:'',nom:'',description:'',dateDebut:'',dateFin:'',statut:'en_attente'}];
  C.innerHTML='<div class="max-w-3xl"><button class="b bs mb-4" onclick="nav(\'projets\')"><i class="fas fa-arrow-left"></i> Retour</button><div class="cd"><form id="pjf">'
    +'<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div><label>Client *</label><select class="ip" name="clientId" required><option value="">Selectionner...</option>'+cl.map(c=>'<option value="'+c.id+'" '+(p?.clientId===c.id?'selected':'')+'>'+c.nom+'</option>').join('')+'</select></div><div><label>Nom du projet *</label><input class="ip" name="nom" required value="'+(p?.nom||'')+'"></div></div>'
    +'<div class="mb-4"><div class="flex items-center justify-between mb-3"><label class="mb-0">Etapes (planning + validation client)</label><button type="button" class="b bs sm" onclick="addPjEt()"><i class="fas fa-plus"></i> Ajouter</button></div><div id="pec" class="space-y-3">'+et.map((e,i)=>pjEtH(e,i)).join('')+'</div></div>'
    +'<div class="flex gap-3 mt-6"><button type="submit" class="b bp"><i class="fas fa-save"></i> Enregistrer</button><button type="button" class="b bs" onclick="nav(\'projets\')">Annuler</button></div>'
  +'</form></div></div>';
  C.querySelector('#pjf').onsubmit=function(e){
    e.preventDefault();
    const f=new FormData(this);
    const old = p ? p.etapes : [];
    const etapes=[]; let i=0;
    while(document.querySelector('[name="en'+i+'"]')){
      const eid=f.get('eid'+i);
      const prev=eid?old.find(x=>x.id===eid):null;
      etapes.push({
        id: eid || uid(),
        nom: f.get('en'+i),
        description: f.get('ede'+i)||'',
        dateDebut: f.get('ed'+i),
        dateFin: f.get('ef'+i),
        statut: f.get('es'+i),
        validePar: prev?.validePar || '',
        dateValidation: prev?.dateValidation || ''
      });
      i++;
    }
    const data={clientId:f.get('clientId'), nom:f.get('nom'), etapes};
    let a=gd(K.pj);
    if(id){ a=a.map(x=>x.id===id?{...x,...data}:x); toast('Modifie','success'); }
    else { a.push({id:uid(),...data}); toast('Cree','success'); }
    sd(K.pj,a);
    nav('projets');
  };
}

/* --- Detail : onglets Planning (Gantt) / Validation --- */
function rPjV(C,id){
  const p=gd(K.pj).find(x=>x.id===id), cl=gd(K.cl);
  if(!p){ C.innerHTML='<div class="es">Introuvable</div>'; return; }
  const c=cl.find(x=>x.id===p.clientId);
  document.getElementById('ptitle').textContent=p.nom;
  const s=pjStats(p);
  C.innerHTML='<button class="b bs mb-4" onclick="nav(\'projets\')"><i class="fas fa-arrow-left"></i> Retour</button>'
    +'<div class="flex flex-wrap gap-2 mb-4"><button class="b bs" onclick="rPjF(\''+id+'\')"><i class="fas fa-pen"></i> Modifier</button><button class="b bp" onclick="genPjVL(\''+id+'\')"><i class="fas fa-link"></i> Lien client</button><button class="b bs" onclick="impPjVR()"><i class="fas fa-download"></i> Importer une reponse</button></div>'
    +'<div class="cd mb-6"><div class="text-sm"><span class="text-muted">Client :</span> <strong>'+(c?.nom||'-')+'</strong> — <span class="text-muted">'+s.t+' etape(s), '+s.va+' validee(s)</span></div></div>'
    +'<div class="flex gap-2 mb-4"><button class="b bs sm pjtab on" data-tab="gantt" onclick="pjTab(\'gantt\')"><i class="fas fa-chart-gantt"></i> Planning</button><button class="b bs sm pjtab" data-tab="val" onclick="pjTab(\'val\')"><i class="fas fa-check-double"></i> Validation</button></div>'
    +'<div id="pjt-gantt">'+pjGanttHTML(p)+'</div>'
    +'<div id="pjt-val" style="display:none">'+pjValHTML(p)+'</div>';
}
function pjTab(t){
  document.querySelectorAll('.pjtab').forEach(b=>b.classList.toggle('on', b.dataset.tab===t));
  document.getElementById('pjt-gantt').style.display = t==='gantt' ? '' : 'none';
  document.getElementById('pjt-val').style.display = t==='val' ? '' : 'none';
}
function pjSetSt(pid,eid,val){
  sd(K.pj, gd(K.pj).map(p=>p.id===pid?{...p,etapes:p.etapes.map(e=>{
    if(e.id!==eid) return e;
    const patch = (val==='valide'||val==='rejete') ? {validePar:e.validePar||'(interne)', dateValidation:new Date().toISOString()} : {};
    return {...e, statut:val, ...patch};
  })}:p));
  toast('Statut mis a jour','success');
  render();
}
function pjGanttHTML(p){
  const legend='<div class="flex flex-wrap gap-3 mb-4 text-xs">'+Object.keys(pjStL).map(k=>'<span class="flex items-center gap-1"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;'+pjStC[k]+'"></span>'+pjStL[k]+'</span>').join('')+'</div>';
  if(!p.etapes.length) return legend+'<div class="cd es"><i class="fas fa-chart-gantt block"></i>Aucune etape.</div>';
  const ds=p.etapes.map(e=>[e.dateDebut,e.dateFin].filter(Boolean).map(d=>new Date(d).getTime())).flat();
  const mn=ds.length?Math.min(...ds):Date.now(), mx=ds.length?Math.max(...ds):Date.now()+864e5, rng=Math.max(mx-mn,864e5);
  const now=Date.now();
  const nowPc = (now>=mn && now<=mx) ? ((now-mn)/rng)*100 : null;
  return legend+'<div class="cd overflow-x-auto"><div style="min-width:700px;position:relative">'
    +(nowPc!=null?'<div style="position:absolute;left:'+nowPc+'%;top:0;bottom:0;width:2px;background:rgb(var(--c-accent));z-index:1" title="Aujourd\'hui"></div>':'')
    +p.etapes.map(e=>{
      const st=e.dateDebut?new Date(e.dateDebut).getTime():mn;
      const en=e.dateFin?new Date(e.dateFin).getTime():st+864e5*3;
      const l=Math.max(0,((st-mn)/rng)*100), w=Math.max(3,((en-st)/rng)*100);
      return '<div class="flex items-center gap-4 mb-3" style="min-height:40px">'
        +'<div class="w-48 flex-shrink-0"><div class="text-sm font-medium truncate">'+(e.nom||'Etape')+'</div><div class="text-xs text-muted">'+fd(e.dateDebut)+' - '+fd(e.dateFin)+'</div></div>'
        +'<div class="flex-1 relative h-10"><div class="gb" style="left:'+l+'%;width:'+w+'%;'+pjStC[e.statut]+'">'+(e.nom||'')+'</div></div>'
        +'<select class="ip w-32 text-xs py-1" onchange="pjSetSt(\''+p.id+'\',\''+e.id+'\',this.value)">'
          +'<option value="en_attente" '+(e.statut==='en_attente'?'selected':'')+'>A valider</option>'
          +'<option value="en_cours" '+(e.statut==='en_cours'?'selected':'')+'>En cours</option>'
          +'<option value="valide" '+(e.statut==='valide'?'selected':'')+'>Valide</option>'
          +'<option value="rejete" '+(e.statut==='rejete'?'selected':'')+'>Rejete</option>'
        +'</select></div>';
    }).join('')
  +'</div></div>';
}
function pjValHTML(p){
  const si={en_attente:'fa-clock text-warning', en_cours:'fa-hourglass-half text-info', valide:'fa-check-circle text-success', rejete:'fa-times-circle text-danger'};
  if(!p.etapes.length) return '<div class="cd es"><i class="fas fa-check-double block"></i>Aucune etape.</div>';
  return '<div class="space-y-3">'+p.etapes.map(e=>
    '<div class="cd flex flex-col md:flex-row md:items-center justify-between gap-3"><div class="flex-1"><div class="flex items-center gap-2 mb-1"><i class="fas '+si[e.statut]+'"></i><h4 class="font-semibold">'+e.nom+'</h4></div>'+(e.description?'<p class="text-sm text-muted">'+e.description+'</p>':'')+'</div><div class="flex items-center gap-3"><span class="badge '+pjStB[e.statut]+'">'+pjStL[e.statut]+'</span>'+(e.validePar?'<div class="text-right text-xs text-muted"><div>par '+e.validePar+'</div><div>'+(e.dateValidation?new Date(e.dateValidation).toLocaleString('fr-FR'):'')+'</div></div>':'')+'</div></div>'
  ).join('')+'</div>';
}

/* --- Lien client / import de reponse (le portail public reste dans portal.js, inchange) --- */
function genPjVL(pid){
  const p=gd(K.pj).find(x=>x.id===pid); if(!p) return;
  const pl=btoa(unescape(encodeURIComponent(JSON.stringify({v:pid, n:p.nom, p:p.etapes.map(e=>({id:e.id,t:e.nom,d:e.description}))}))));
  const url=location.origin+location.pathname+'#val='+pl;
  showM('Lien de validation','<p class="text-sm text-muted mb-3">Envoyez ce lien au client :</p><input class="ip font-mono text-xs mb-3" value="'+url+'" readonly onclick="this.select()" id="vli"><div class="flex gap-2"><button class="b bp sm" onclick="navigator.clipboard.writeText(document.getElementById(\'vli\').value);toast(\'Copie\',\'success\')"><i class="fas fa-copy"></i> Copier</button></div><div class="mt-4 p-3 bg-surface2 rounded-lg text-xs text-muted"><strong>Processus :</strong><ol class="list-decimal ml-4 mt-1 space-y-1"><li>Envoyez le lien au client</li><li>Il valide/rejette les etapes</li><li>Il vous renvoie le lien de reponse</li><li>Cliquez "Importer une reponse" et collez le lien</li></ol></div>');
}
function impPjVR(){
  showM('Importer une reponse','<p class="text-sm text-muted mb-3">Collez le lien de reponse du client :</p><input class="ip font-mono text-xs mb-4" id="ri"><div class="flex gap-3 justify-end"><button class="b bs" onclick="closeM()">Annuler</button><button class="b bp" onclick="procPjVR()">Importer</button></div>');
}
function importVResp(enc){
  impPjVR();
  setTimeout(()=>{ const i=document.getElementById('ri'); if(i) i.value='#resp='+enc; }, 100);
}
function procPjVR(){
  let v=document.getElementById('ri').value.trim();
  if(v.includes('#resp=')) v=v.split('#resp=')[1];
  try{
    const d=JSON.parse(decodeURIComponent(escape(atob(v))));
    const a=gd(K.pj);
    const i=a.findIndex(x=>x.id===d.v);
    if(i===-1){ toast('Projet introuvable','error'); return; }
    d.r.forEach(r=>{
      if(r.s!=='valide' && r.s!=='rejete') return; // on ignore les etapes que le client n'a pas traitees
      const ei=a[i].etapes.findIndex(e=>e.id===r.id);
      if(ei!==-1){ a[i].etapes[ei].statut=r.s; a[i].etapes[ei].validePar=r.n; a[i].etapes[ei].dateValidation=r.d; }
    });
    sd(K.pj,a);
    closeM();
    toast('Reponse importee !','success');
    render();
  }catch(e){ toast('Lien invalide','error'); }
}
