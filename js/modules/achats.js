/* === ACHATS === */
const acCat={charges_sociales:'Charges sociales',materiel:'Materiel',fournisseur:'Facture fournisseur',autre:'Autre'};
function rAc(C){
  const a=gd(K.ac).slice().sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const tot=a.reduce((s,x)=>s+(parseFloat(x.montant)||0),0);
  C.innerHTML='<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div class="relative flex-1 max-w-xs"><i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm"></i><input class="ip pl-9" placeholder="Rechercher..." oninput="ft(\'acr\',this.value)"></div><div class="flex gap-2"><button class="b bs" onclick="expCSVModal(\'achats\')"><i class="fas fa-file-csv"></i> Export CSV</button><button class="b bp" id="btn-new-ac"><i class="fas fa-plus"></i> Nouvel achat</button></div></div><div class="cd mb-4"><span class="text-muted text-sm">Total enregistre : </span><span class="font-semibold text-lg">'+fm(tot)+'</span></div><div class="cd overflow-x-auto">'+(a.length?'<table><thead><tr><th>Date</th><th>Categorie</th><th>Libelle</th><th class="text-right">Montant</th><th class="text-right">Actions</th></tr></thead><tbody>'+a.map(x=>'<tr class="acr" data-s="'+((x.libelle||'')+' '+(acCat[x.categorie]||'')).toLowerCase()+'"><td class="text-muted text-sm">'+fd(x.date)+'</td><td><span class="badge bdr">'+(acCat[x.categorie]||x.categorie)+'</span></td><td>'+(x.libelle||'-')+'</td><td class="text-right font-medium">'+fm(x.montant)+'</td><td class="text-right"><button class="b bs sm" data-act="edit" data-id="'+x.id+'"><i class="fas fa-pen"></i></button> <button class="b bd sm" data-act="del" data-id="'+x.id+'"><i class="fas fa-trash"></i></button></td></tr>').join('')+'</tbody></table>':'<div class="es"><i class="fas fa-cart-shopping block"></i>Aucun achat enregistre.</div>')+'</div>';
  C.querySelector('#btn-new-ac')?.addEventListener('click',()=>rAcF());
  C.querySelectorAll('[data-act="edit"]').forEach(e=>e.onclick=()=>rAcF(e.dataset.id));
  C.querySelectorAll('[data-act="del"]').forEach(e=>e.onclick=()=>cfm('Supprimer ?','Action irreversible.',function(){sd(K.ac,gd(K.ac).filter(x=>x.id!==e.dataset.id));toast('Supprime','success');render()}));
}
function rAcF(id){
  const x=id?gd(K.ac).find(v=>v.id===id):null;
  showM(x?'Modifier l\'achat':'Nouvel achat','<form id="acf"><div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label>Date *</label><input class="ip" name="date" type="date" required value="'+(x?.date||td())+'"></div><div><label>Categorie</label><select class="ip" name="categorie">'+Object.entries(acCat).map(([k,v])=>'<option value="'+k+'" '+(x?.categorie===k?'selected':'')+'>'+v+'</option>').join('')+'</select></div></div><div class="mb-4"><label>Libelle *</label><input class="ip" name="libelle" required value="'+(x?.libelle||'').replace(/"/g,'&quot;')+'"></div><div class="mb-4"><label>Montant (TTC) *</label><input class="ip" name="montant" type="number" min="0" step="0.01" required value="'+(x?.montant||'')+'"></div><div class="mb-6"><label>Notes</label><textarea class="ip" name="notes" rows="2">'+(x?.notes||'')+'</textarea></div><div class="flex gap-3 justify-end"><button type="button" class="b bs" onclick="closeM()">Annuler</button><button type="submit" class="b bp"><i class="fas fa-save"></i> Enregistrer</button></div></form>');
  document.getElementById('acf').onsubmit=function(e){
    e.preventDefault();const f=new FormData(this);const d=Object.fromEntries(f);d.montant=parseFloat(d.montant)||0;let a=gd(K.ac);
    if(id){a=a.map(v=>v.id===id?{...v,...d}:v);toast('Modifie','success')}else{a.push({id:uid(),...d});toast('Cree','success')}
    sd(K.ac,a);closeM();render();
  };
}
