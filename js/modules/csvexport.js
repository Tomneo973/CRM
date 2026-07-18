/* === EXPORT CSV === */
function csvEsc(v){v=v==null?'':String(v);return/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCSV(rows,headers){const lines=[headers.map(h=>csvEsc(h.label)).join(';')];rows.forEach(r=>lines.push(headers.map(h=>csvEsc(h.get(r))).join(';')));return'\uFEFF'+lines.join('\r\n')}
function downloadCSV(filename,content){const blob=new Blob([content],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}
function inRange(d,start,end){if(!d)return!start&&!end;if(start&&d<start)return!1;if(end&&d>end)return!1;return!0}
function expDevisCSV(start,end){
  const cl=gd(K.cl);const rows=gd(K.dv).filter(d=>inRange(d.date,start,end)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  if(!rows.length){toast('Aucun devis sur cette periode','error');return}
  const headers=[{label:'Numero',get:r=>r.numero},{label:'Date',get:r=>fd(r.date)},{label:'Validite',get:r=>fd(r.dateValidite)},{label:'Client',get:r=>{const c=cl.find(x=>x.id===r.clientId);return c?c.nom:''}},{label:'Statut',get:r=>r.statut},{label:'Total HT',get:r=>(r.totalHT||0).toFixed(2)},{label:'Taux TVA (%)',get:r=>tvxOf(r)},{label:'Total TVA',get:r=>(r.totalTVA||0).toFixed(2)},{label:'Total TTC',get:r=>(r.totalTTC||0).toFixed(2)},{label:'Devise',get:r=>r.devise||'CHF'},{label:'Notes',get:r=>r.notes||''}];
  downloadCSV('devis_'+(start||'debut')+'_'+(end||'fin')+'.csv',toCSV(rows,headers));toast(rows.length+' devis exporte(s)','success');
}
function expFacturesCSV(start,end){
  const cl=gd(K.cl);const rows=gd(K.fc).filter(f=>inRange(f.date,start,end)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  if(!rows.length){toast('Aucune facture sur cette periode','error');return}
  const headers=[{label:'Numero',get:r=>r.numero},{label:'Date',get:r=>fd(r.date)},{label:'Echeance',get:r=>fd(r.dateEcheance)},{label:'Client',get:r=>{const c=cl.find(x=>x.id===r.clientId);return c?c.nom:''}},{label:'Statut',get:r=>r.statut},{label:'Total HT',get:r=>(r.totalHT||0).toFixed(2)},{label:'Taux TVA (%)',get:r=>tvxOf(r)},{label:'Total TVA',get:r=>(r.totalTVA||0).toFixed(2)},{label:'Total TTC',get:r=>(r.totalTTC||0).toFixed(2)},{label:'Devise',get:r=>r.devise||'CHF'},{label:'Notes',get:r=>r.notes||''}];
  downloadCSV('factures_'+(start||'debut')+'_'+(end||'fin')+'.csv',toCSV(rows,headers));toast(rows.length+' facture(s) exportee(s)','success');
}
function expAchatsCSV(start,end){
  const rows=gd(K.ac).filter(x=>inRange(x.date,start,end)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  if(!rows.length){toast('Aucun achat sur cette periode','error');return}
  const headers=[{label:'Date',get:r=>fd(r.date)},{label:'Categorie',get:r=>acCat[r.categorie]||r.categorie},{label:'Libelle',get:r=>r.libelle||''},{label:'Montant',get:r=>(parseFloat(r.montant)||0).toFixed(2)},{label:'Notes',get:r=>r.notes||''}];
  downloadCSV('achats_'+(start||'debut')+'_'+(end||'fin')+'.csv',toCSV(rows,headers));toast(rows.length+' achat(s) exporte(s)','success');
}
function expCSVModal(type){
  const titles={factures:'les factures',devis:'les devis',achats:'les achats'};
  showM('Exporter CSV : '+titles[type],'<form id="expf"><p class="text-sm text-muted mb-4">Laissez les dates vides pour tout exporter.</p><div class="grid grid-cols-2 gap-4 mb-6"><div><label>Du</label><input class="ip" name="start" type="date"></div><div><label>Au</label><input class="ip" name="end" type="date"></div></div><div class="flex gap-3 justify-end"><button type="button" class="b bs" onclick="closeM()">Annuler</button><button type="submit" class="b bp"><i class="fas fa-file-csv"></i> Exporter</button></div></form>');
  document.getElementById('expf').onsubmit=function(e){
    e.preventDefault();const f=new FormData(this);const start=f.get('start')||'',end=f.get('end')||'';closeM();
    if(type==='factures')expFacturesCSV(start,end);else if(type==='devis')expDevisCSV(start,end);else if(type==='achats')expAchatsCSV(start,end);
  };
}

/* Toast */
