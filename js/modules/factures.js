/* === FACTURES === */
function rFc(C){
  const a=gd(K.fc),cl=gd(K.cl);
  C.innerHTML='<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div class="relative flex-1 max-w-xs"><i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm"></i><input class="ip pl-9" placeholder="Rechercher..." oninput="ft(\'fcr\',this.value)"></div><div class="flex gap-2"><button class="b bs" onclick="expCSVModal(\'factures\')"><i class="fas fa-file-csv"></i> Export CSV</button><button class="b bp" onclick="rFcF()"><i class="fas fa-plus"></i> Nouvelle facture</button></div></div><div class="cd overflow-x-auto">'+(a.length?'<table><thead><tr><th>Numero</th><th>Client</th><th>Date</th><th>Total TTC</th><th>Statut</th><th class="text-right">Actions</th></tr></thead><tbody>'+a.map(f=>{const c=cl.find(x=>x.id===f.clientId);return'<tr class="fcr" data-s="'+(f.numero+' '+(c?.nom||'')).toLowerCase()+'"><td class="font-mono text-accent text-xs cursor-pointer" onclick="nav(\'factures\',{id:\''+f.id+'\'})">'+f.numero+'</td><td class="cursor-pointer" onclick="nav(\'factures\',{id:\''+f.id+'\'})">'+(c?.nom||'-')+'</td><td class="text-muted text-sm">'+fd(f.date)+'</td><td class="font-semibold">'+fm(f.totalTTC,f.devise)+'</td><td>'+bsg(f.statut,'facture')+'</td><td class="text-right"><button class="b bs sm" onclick="nav(\'factures\',{id:\''+f.id+'\'})"><i class="fas fa-eye"></i></button> <button class="b bd sm" onclick="cfm(\'Supprimer ?\',\'\',function(){sd(K.fc,gd(K.fc).filter(x=>x.id!==\''+f.id+'\'));toast(\'Supprime\',\'success\');render()})"><i class="fas fa-trash"></i></button></td></tr>'}).join('')+'</tbody></table>':'<div class="es"><i class="fas fa-file-invoice-dollar block"></i>Aucune facture.</div>')+'</div>';
}
function rFcF(id){
  const f=id?gd(K.fc).find(x=>x.id===id):null;const cl=gd(K.cl);
  document.getElementById('ptitle').textContent=f?'Modifier la facture':'Nouvelle facture';
  const C=document.getElementById('ct');const lg=f?f.lignes:[{description:'',quantite:1,prixUnitaire:0}];
  C.innerHTML='<div class="max-w-4xl"><button class="b bs mb-4" onclick="nav(\'factures\')"><i class="fas fa-arrow-left"></i> Retour</button><div class="cd"><form id="fcf"><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div><label>Client *</label><select class="ip" name="clientId" required><option value="">Selectionner...</option>'+cl.map(c=>'<option value="'+c.id+'" '+(f?.clientId===c.id?'selected':'')+'>'+c.nom+'</option>').join('')+'</select></div><div><label>Date</label><input class="ip" name="date" type="date" value="'+(f?.date||td())+'"></div><div><label>Echeance</label><input class="ip" name="dateEcheance" type="date" value="'+(f?.dateEcheance||'')+'"></div></div><div class="mb-4"><div class="flex items-center justify-between mb-3"><label class="mb-0">Lignes</label><button type="button" class="b bs sm" onclick="addLn()"><i class="fas fa-plus"></i> Ajouter</button></div><div class="lr text-xs text-muted font-semibold uppercase mb-2"><span>Description</span><span class="mh">Qte</span><span class="mh">Prix unit.</span><span class="mh">Total</span><span></span></div><div id="lc">'+lg.map((l,i)=>lnH(l,i)).join('')+'</div></div><div class="flex flex-col sm:flex-row sm:justify-end gap-4 mb-6"><div class="w-full sm:w-28"><label>Devise</label><select class="ip" id="dvsel" name="devise" onchange="updT()"><option value="CHF" '+((f?.devise||gSt().devise||'CHF')==='CHF'?'selected':'')+'>CHF</option><option value="EUR" '+((f?.devise||gSt().devise||'CHF')==='EUR'?'selected':'')+'>EUR</option></select></div><div class="w-full sm:w-40"><label>Taux TVA (%)</label><input class="ip" id="tvxr" type="number" min="0" max="100" step="0.1" value="'+(f?tvxOf(f):(gSt().tva||20))+'" oninput="updT()"></div><div class="w-64 space-y-1 text-sm text-right" id="td"></div></div><div class="mb-4"><label>Notes</label><textarea class="ip" name="notes" rows="2">'+(f?.notes||'')+'</textarea></div><div class="flex gap-3"><button type="submit" class="b bp"><i class="fas fa-save"></i> Enregistrer</button><button type="button" class="b bs" onclick="nav(\'factures\')">Annuler</button></div></form></div></div>';
  updT();
  C.querySelector('#fcf').onsubmit=function(e){
    e.preventDefault();const fd2=new FormData(this);const ln=getLn();const h=ln.reduce((s,l)=>s+l.total,0);const tx=parseFloat(document.getElementById('tvxr').value)||0;const tv=h*tx/100;
    const data={clientId:fd2.get('clientId'),date:fd2.get('date'),dateEcheance:fd2.get('dateEcheance'),lignes:ln,totalHT:h,totalTVA:tv,totalTTC:h+tv,tauxTVA:tx,devise:fd2.get('devise')||'CHF',notes:fd2.get('notes')};
    let a=gd(K.fc);
    if(id){a=a.map(x=>x.id===id?{...x,...data}:x);toast('Modifiee','success')}else{a.push({id:uid(),devisId:null,...data,statut:'brouillon'});toast('Creee','success')}
    sd(K.fc,a);nav('factures');
  };
}
function rFcV(C,id){
  const f=gd(K.fc).find(x=>x.id===id),cl=gd(K.cl);if(!f){C.innerHTML='<div class="es">Introuvable</div>';return}
  const c=cl.find(x=>x.id===f.clientId),sg=gs(K.sg),st=gSt();
  document.getElementById('ptitle').textContent=f.numero;
  C.innerHTML='<button class="b bs mb-4" onclick="nav(\'factures\')"><i class="fas fa-arrow-left"></i> Retour</button><div class="flex flex-wrap gap-2 mb-4"><button class="b bp" onclick="expPdf(\'facture\',\''+id+'\')"><i class="fas fa-file-pdf"></i> PDF</button>'+(gSt().qrEnabled!==false?'<button class="b bs" onclick="previewQR(\'facture\',\''+id+'\')"><i class="fas fa-qrcode"></i> Apercu QR-facture</button>':'')+'<button class="b bs" onclick="rFcF(\''+id+'\')"><i class="fas fa-pen"></i> Modifier</button><select class="ip w-auto" onchange="chSt(\'fc\',\''+id+'\',this.value)"><option value="brouillon" '+(f.statut==='brouillon'?'selected':'')+'>Brouillon</option><option value="envoyee" '+(f.statut==='envoyee'?'selected':'')+'>Envoyee</option><option value="payee" '+(f.statut==='payee'?'selected':'')+'>Payee</option><option value="retard" '+(f.statut==='retard'?'selected':'')+'>En retard</option></select></div><div class="cd"><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div><div class="text-xs text-muted uppercase tracking-wider mb-1">Emetteur</div><div class="font-semibold">'+(st.nom||'')+'</div><div class="text-sm text-muted">'+(st.adresse||'')+'<br>'+(st.email||'')+'</div></div><div class="text-right"><div class="text-xs text-muted uppercase tracking-wider mb-1">Client</div><div class="font-semibold">'+(c?.nom||'-')+'</div><div class="text-sm text-muted">'+(c?.entreprise||'')+'<br>'+(c?.adresse||'')+'</div></div></div><div class="grid grid-cols-4 gap-4 mb-6"><div><span class="text-xs text-muted">Numero</span><div class="font-mono text-accent font-semibold">'+f.numero+'</div></div><div><span class="text-xs text-muted">Date</span><div>'+fd(f.date)+'</div></div><div><span class="text-xs text-muted">Echeance</span><div>'+fd(f.dateEcheance)+'</div></div><div><span class="text-xs text-muted">Statut</span><div>'+bsg(f.statut,'facture')+'</div></div></div>'+(f.devisId?'<div class="mb-4 text-sm text-muted">Ref. devis : <span class="text-accent font-mono">'+(gd(K.dv).find(d=>d.id===f.devisId)?.numero||'-')+'</span></div>':'')+'<table><thead><tr><th>Description</th><th class="text-right">Qte</th><th class="text-right">Prix unit.</th><th class="text-right">Total</th></tr></thead><tbody>'+f.lignes.map(l=>'<tr><td>'+l.description+'</td><td class="text-right">'+l.quantite+'</td><td class="text-right">'+fm(l.prixUnitaire,f.devise)+'</td><td class="text-right font-medium">'+fm(l.total,f.devise)+'</td></tr>').join('')+'</tbody></table><div class="flex justify-end mt-4"><div class="w-64 space-y-1 text-sm"><div class="flex justify-between"><span class="text-muted">HT</span><span>'+fm(f.totalHT,f.devise)+'</span></div><div class="flex justify-between"><span class="text-muted">TVA ('+tvxOf(f)+'%)</span><span>'+fm(f.totalTVA,f.devise)+'</span></div><div class="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2"><span>TTC</span><span class="text-accent">'+fm(f.totalTTC,f.devise)+'</span></div></div></div>'+(sg[f.clientId]?'<div class="mt-6 pt-4 border-t border-border"><div class="text-xs text-muted uppercase tracking-wider mb-2">Signature</div><img src="'+sg[f.clientId]+'" class="h-20 bg-white/5 p-2 rounded-lg"></div>':'')+(f.notes?'<div class="mt-4 p-3 bg-surface2 rounded-lg text-sm text-muted">'+f.notes+'</div>':'')+'</div>';
}
// ===== DÉBUT AJOUT =====

// --- Enregistrer un paiement partiel ---
function enregistrerPaiement(factureId, paiement) {
  var factures = getStored(STORAGE_KEYS.factures) || [];
  var idx = factures.findIndex(function(f) { return f.id === factureId; });
  if (idx === -1) { toast('Facture introuvable', 'error'); return false; }

  var facture = factures[idx];
  if (!facture.paiements) facture.paiements = [];

  var soldeAvant = calculerSolde(facture);
  var montant = parseFloat(paiement.montant) || 0;

  if (montant <= 0) { toast('Le montant doit être positif', 'error'); return false; }
  if (montant > soldeAvant + 0.01) { toast('Le montant dépasse le solde dû (' + formatMoney(soldeAvant) + ')', 'error'); return false; }

  facture.paiements.push({
    id: 'pay_' + Date.now(),
    date: paiement.date || new Date().toISOString().split('T')[0],
    montant: montant,
    methode: paiement.methode || 'Virement',
    reference: paiement.reference || ''
  });

  // Mettre à jour le statut
  var nouveauSolde = calculerSolde(facture);
  if (nouveauSolde <= 0.01) {
    facture.statut = 'Payee';
  } else {
    facture.statut = 'Partiellement payee';
  }

  factures[idx] = facture;
  setStored(STORAGE_KEYS.factures, factures);
  toast('Paiement de ' + formatMoney(montant) + ' enregistré', 'success');
  return true;
}

// --- Supprimer un paiement ---
function supprimerPaiement(factureId, paiementId) {
  var factures = getStored(STORAGE_KEYS.factures) || [];
  var idx = factures.findIndex(function(f) { return f.id === factureId; });
  if (idx === -1) return;

  var facture = factures[idx];
  facture.paiements = (facture.paiements || []).filter(function(p) { return p.id !== paiementId; });

  // Recalculer le statut
  var solde = calculerSolde(facture);
  if (solde <= 0.01) {
    facture.statut = 'Payee';
  } else if (facture.paiements.length > 0) {
    facture.statut = 'Partiellement payee';
  } else {
    facture.statut = 'Envoyee'; // ou le statut d'origine
  }

  factures[idx] = facture;
  setStored(STORAGE_KEYS.factures, factures);
  toast('Paiement supprimé', 'success');
}

// --- HTML de la section paiements (pour la vue détail) ---
function renderSectionPaiements(facture) {
  var paiements = facture.paiements || [];
  var solde = calculerSolde(facture);
  var statutPaiement = getStatutPaiement(facture);

  var couleurs = {
    'payee': '#27ae60',
    'partielle': '#f39c12',
    'impayee': '#e74c3c',
    'zero': '#95a5a6'
  };

  var html = '<div class="section-paiements" style="margin-top:24px;padding:16px;border:1px solid var(--border);border-radius:8px;background:var(--card-bg)">' +
    '<h3 style="margin-top:0">💰 Suivi des paiements</h3>' +
    '<div class="paiement-resume" style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:16px">' +
      '<div><strong>Total facture :</strong> ' + formatMoney(facture.total) + '</div>' +
      '<div><strong>Total payé :</strong> ' + formatMoney(facture.total - solde) + '</div>' +
      '<div style="color:' + (couleurs[statutPaiement] || '#333') + ';font-weight:700"><strong>Solde dû :</strong> ' + formatMoney(solde) + '</div>' +
    '</div>';

  // Barre de progression
  var pct = facture.total > 0 ? Math.min(100, ((facture.total - solde) / facture.total * 100)) : 0;
  html += '<div style="background:#e0e0e0;border-radius:4px;height:8px;margin-bottom:16px;overflow:hidden">' +
    '<div style="background:' + (couleurs[statutPaiement] || '#27ae60') + ';height:100%;width:' + pct + '%;transition:width 0.3s"></div>' +
  '</div>';

  // Table des paiements
  if (paiements.length > 0) {
    html += '<table style="width:100%;border-collapse:collapse;font-size:0.9em">' +
      '<thead><tr style="border-bottom:2px solid var(--border)">' +
        '<th style="text-align:left;padding:6px">Date</th>' +
        '<th style="text-align:left;padding:6px">Mode</th>' +
        '<th style="text-align:left;padding:6px">Référence</th>' +
        '<th style="text-align:right;padding:6px">Montant</th>' +
        '<th style="width:40px"></th>' +
      '</tr></thead><tbody>';
    paiements.forEach(function(p) {
      html += '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="padding:6px">' + formatDate(p.date) + '</td>' +
        '<td style="padding:6px">' + escapeHtml(p.methode) + '</td>' +
        '<td style="padding:6px">' + escapeHtml(p.reference || '—') + '</td>' +
        '<td style="padding:6px;text-align:right;font-weight:600">' + formatMoney(p.montant) + '</td>' +
        '<td style="padding:6px;text-align:center"><button class="btn-del-paiement" data-facture-id="' + facture.id + '" data-paiement-id="' + p.id + '" title="Supprimer" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:1.1em">✕</button></td>' +
      '</tr>';
    });
    html += '</tbody></table>';
  } else {
    html += '<p style="color:var(--text-muted);font-style:italic">Aucun paiement enregistré.</p>';
  }

  // Formulaire d'ajout
  if (solde > 0.01) {
    html += '<div class="form-ajout-paiement" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">' +
      '<h4 style="margin-top:0;margin-bottom:8px">Ajouter un paiement</h4>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">' +
        '<div><label style="font-size:0.8em;display:block">Date</label><input type="date" id="paiement-date" value="' + new Date().toISOString().split('T')[0] + '" style="padding:6px"></div>' +
        '<div><label style="font-size:0.8em;display:block">Montant (CHF)</label><input type="number" id="paiement-montant" min="0.01" step="0.01" max="' + solde.toFixed(2) + '" placeholder="' + solde.toFixed(2) + '" style="padding:6px;width:100px"></div>' +
        '<div><label style="font-size:0.8em;display:block">Mode</label><select id="paiement-methode" style="padding:6px">' +
          '<option>Virement</option><option>Carte</option><option>Espèces</option><option>Twint</option><option>Autre</option>' +
        '</select></div>' +
        '<div><label style="font-size:0.8em;display:block">Référence</label><input type="text" id="paiement-ref" placeholder="Optionnel" style="padding:6px;width:140px"></div>' +
        '<button id="btn-ajouter-paiement" data-facture-id="' + facture.id + '" style="padding:6px 16px;background:var(--primary);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">+ Ajouter</button>' +
      '</div>' +
    '</div>';
  }

  html += '</div>';
  return html;
}

// ===== FIN AJOUT =====
