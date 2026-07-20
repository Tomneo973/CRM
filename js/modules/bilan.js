/* === BILAN ANNUEL === */
function yrOf(d){return d?d.split('-')[0]:null}
function sumByDev(list,field){const o={};list.forEach(x=>{const d=x.devise||'CHF';o[d]=(o[d]||0)+(x[field]||0)});return o}
function fmMulti(o){const k=Object.keys(o);if(!k.length)return fm(0,gSt().devise||'CHF');return k.map(c=>fm(o[c],c)).join(' + ')}

/* --- TVA a reverser --- */
function quarterOf(d){if(!d)return null;const m=parseInt(d.split('-')[1],10);return Math.floor((m-1)/3)+1}
function calcTvaTrimestres(year,method){
  const fc=gd(K.fc).filter(f=>f.statut!=='brouillon'&&f.statut!=='refuse');
  const devDef=gSt().devise||'CHF';
  const q=[{ht:0,tva:0},{ht:0,tva:0},{ht:0,tva:0},{ht:0,tva:0}];
  if(method==='encaissee'){
    fc.forEach(f=>{
      if((f.devise||devDef)!==devDef)return;
      const taux=tvxOf(f);
      paiementsOf(f).forEach(p=>{
        if(yrOf(p.date)!==year)return;
        const qi=quarterOf(p.date);if(!qi)return;
        const montant=parseFloat(p.montant)||0;
        const tvaPart=montant*taux/(100+taux);
        q[qi-1].tva+=tvaPart;q[qi-1].ht+=montant-tvaPart;
      });
    });
  }else{
    fc.forEach(f=>{
      if(yrOf(f.date)!==year)return;
      if((f.devise||devDef)!==devDef)return;
      const qi=quarterOf(f.date);if(!qi)return;
      q[qi-1].tva+=f.totalTVA||0;q[qi-1].ht+=f.totalHT||0;
    });
  }
  return q;
}
function tvaSectionHTML(year){
  const st=gSt();const method=st.tvaMethode==='encaissee'?'encaissee':'facturee';
  const devDef=st.devise||'CHF';
  const q=calcTvaTrimestres(year,method);
  const totTva=q.reduce((s,x)=>s+x.tva,0),totHt=q.reduce((s,x)=>s+x.ht,0);
  const multiDevExists=Array.from(new Set(gd(K.fc).filter(f=>yrOf(f.date)===year).map(f=>f.devise||devDef))).length>1;
  return '<div class="cd mb-6"><div class="flex items-center justify-between mb-2 flex-wrap gap-2"><h3 class="font-semibold"><i class="fas fa-percent mr-2 text-accent"></i>TVA a reverser (indicatif)</h3><div class="text-xs text-muted">Methode : <strong>'+(method==='encaissee'?'contre-encaissement':'contre-prestations facturees')+'</strong> <a href="#" onclick="event.preventDefault();nav(\'parametres\')" class="text-accent underline">changer</a></div></div>'
    +(multiDevExists?'<p class="text-xs text-muted mb-3"><i class="fas fa-circle-info mr-1"></i>Seules les factures en '+devDef+' (devise par defaut) sont incluses dans ce calcul.</p>':'')
    +'<table><thead><tr><th>Periode</th><th class="text-right">CA HT</th><th class="text-right">TVA collectee</th></tr></thead><tbody>'
    +q.map((x,i)=>'<tr><td>T'+(i+1)+' '+year+'</td><td class="text-right">'+fm(x.ht,devDef)+'</td><td class="text-right font-medium">'+fm(x.tva,devDef)+'</td></tr>').join('')
    +'</tbody><tfoot><tr><td class="font-semibold">Total annuel</td><td class="text-right font-semibold">'+fm(totHt,devDef)+'</td><td class="text-right font-bold text-accent">'+fm(totTva,devDef)+'</td></tr></tfoot></table>'
    +'<p class="text-xs text-muted mt-3"><i class="fas fa-triangle-exclamation mr-1"></i>Estimation basee sur vos factures/paiements enregistres. Cela ne remplace pas votre decompte TVA officiel aupres de l\'AFC (methode effective avec deduction de l\'impot prealable non geree ici).</p>'
    +'</div>';
}

function rBil(C){
  const fc=gd(K.fc),ac=gd(K.ac);
  const yrs=Array.from(new Set([...fc.map(f=>yrOf(f.date)),...ac.map(x=>yrOf(x.date))].filter(Boolean))).sort((a,b)=>b-a);
  if(!yrs.length){C.innerHTML='<div class="es"><i class="fas fa-chart-pie block"></i>Aucune donnee. Creez une facture ou un achat pour voir apparaitre un bilan annuel.</div>';return}
  C.innerHTML='<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">'+yrs.map(y=>{
    const fy=fc.filter(f=>yrOf(f.date)===y),ay=ac.filter(x=>yrOf(x.date)===y);
    const caByDev=sumByDev(fy,'totalTTC'),encByDev=sumByDev(fy.filter(f=>f.statut==='payee'),'totalTTC');
    const acht=ay.reduce((s,x)=>s+(parseFloat(x.montant)||0),0);
    const devDef=gSt().devise||'CHF';
    const netSingle=Object.keys(encByDev).length<=1?fm((encByDev[devDef]||Object.values(encByDev)[0]||0)-acht,Object.keys(encByDev)[0]||devDef):null;
    return'<div class="cd cursor-pointer hover:border-accent/30 transition-colors" onclick="nav(\'bilan\',{id:\''+y+'\'})"><div class="flex items-center justify-between mb-3"><h3 class="text-xl font-bold">'+y+'</h3><i class="fas fa-chevron-right text-muted"></i></div><div class="space-y-2 text-sm"><div class="flex justify-between gap-3"><span class="text-muted">Facture ('+fy.length+')</span><span class="font-medium text-right">'+fmMulti(caByDev)+'</span></div><div class="flex justify-between gap-3"><span class="text-muted">Encaisse</span><span class="font-medium text-success text-right">'+fmMulti(encByDev)+'</span></div><div class="flex justify-between"><span class="text-muted">Achats ('+ay.length+')</span><span class="font-medium text-danger">'+fm(acht,devDef)+'</span></div><div class="flex justify-between pt-2 border-t border-border"><span class="font-semibold">Resultat</span>'+(netSingle?'<span class="font-bold '+((encByDev[devDef]||0)-acht>=0?'text-success':'text-danger')+'">'+netSingle+'</span>':'<span class="text-xs text-muted">voir detail</span>')+'</div></div></div>';
  }).join('')+'</div>';
}
function rBilV(C,year){
  const fc=gd(K.fc).filter(f=>yrOf(f.date)===year),ac=gd(K.ac).filter(x=>yrOf(x.date)===year),cl=gd(K.cl);
  document.getElementById('ptitle').textContent='Bilan '+year;
  const htByDev=sumByDev(fc,'totalHT'),tvaByDev=sumByDev(fc,'totalTVA'),ttcByDev=sumByDev(fc,'totalTTC');
  const encByDev=sumByDev(fc.filter(f=>f.statut==='payee'),'totalTTC');
  const attByDev=sumByDev(fc.filter(f=>f.statut==='envoyee'||f.statut==='retard'||f.statut==='partiel'),'totalTTC');
  const totAch=ac.reduce((s,x)=>s+(parseFloat(x.montant)||0),0),devDef=gSt().devise||'CHF';
  const multiDev=Object.keys(ttcByDev).length>1;
  const byCat={};ac.forEach(x=>{byCat[x.categorie]=(byCat[x.categorie]||0)+(parseFloat(x.montant)||0)});
  C.innerHTML='<button class="b bs mb-4" onclick="nav(\'bilan\')"><i class="fas fa-arrow-left"></i> Retour</button><div class="flex flex-wrap gap-2 mb-4"><button class="b bp" onclick="expBilanPdf(\''+year+'\')"><i class="fas fa-file-pdf"></i> Export PDF bilan</button><button class="b bs" onclick="expFacturesCSV(\''+year+'-01-01\',\''+year+'-12-31\')"><i class="fas fa-file-csv"></i> Export factures '+year+'</button><button class="b bs" onclick="expAchatsCSV(\''+year+'-01-01\',\''+year+'-12-31\')"><i class="fas fa-file-csv"></i> Export achats '+year+'</button></div>'
    +(multiDev?'<div class="cd mb-4 text-sm text-muted"><i class="fas fa-circle-info mr-1"></i>Plusieurs devises detectees cette annee : les totaux sont detailles par devise (aucun mélange CHF/EUR).</div>':'')
    +'<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"><div class="sc bl"><div class="text-muted text-xs font-semibold uppercase tracking-wider mb-1">CA facture HT</div><div class="text-xl font-bold text-fg">'+fmMulti(htByDev)+'</div></div><div class="sc g"><div class="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Encaisse</div><div class="text-xl font-bold text-fg">'+fmMulti(encByDev)+'</div></div><div class="sc r"><div class="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Achats / charges</div><div class="text-xl font-bold text-fg">'+fm(totAch,devDef)+'</div></div><div class="sc a"><div class="text-muted text-xs font-semibold uppercase tracking-wider mb-1">Resultat (encaisse - achats)</div><div class="text-xl font-bold '+((encByDev[devDef]||0)-totAch>=0?'text-success':'text-danger')+'">'+fm((encByDev[devDef]||Object.values(encByDev)[0]||0)-totAch,Object.keys(encByDev)[0]||devDef)+(multiDev?' <span class="text-xs font-normal text-muted">(devise principale uniquement)</span>':'')+'</div></div></div>'
    +tvaSectionHTML(year)
    +'<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="cd"><h3 class="font-semibold mb-4">Factures '+year+' ('+fc.length+')</h3>'+(fc.length?'<table><thead><tr><th>Numero</th><th>Client</th><th>Date</th><th class="text-right">TTC</th><th>Statut</th></tr></thead><tbody>'+fc.map(f=>{const c=cl.find(x=>x.id===f.clientId);return'<tr class="cursor-pointer" onclick="nav(\'factures\',{id:\''+f.id+'\'})"><td class="font-mono text-accent text-xs">'+f.numero+'</td><td>'+(c?.nom||'-')+'</td><td class="text-muted text-sm">'+fd(f.date)+'</td><td class="text-right">'+fm(f.totalTTC,f.devise)+'</td><td>'+bsg(f.statut,'facture')+'</td></tr>'}).join('')+'</tbody></table>':'<p class="text-muted text-sm">Aucune facture cette annee</p>')+'<div class="mt-4 pt-4 border-t border-border text-sm space-y-1"><div class="flex justify-between gap-3"><span class="text-muted">Total TVA</span><span class="text-right">'+fmMulti(tvaByDev)+'</span></div><div class="flex justify-between gap-3"><span class="text-muted">Total TTC</span><span class="text-right">'+fmMulti(ttcByDev)+'</span></div><div class="flex justify-between gap-3"><span class="text-muted">Encaisse</span><span class="text-right">'+fmMulti(encByDev)+'</span></div><div class="flex justify-between gap-3"><span class="text-muted">En attente</span><span class="text-right">'+fmMulti(attByDev)+'</span></div></div></div><div class="cd"><h3 class="font-semibold mb-4">Achats '+year+' ('+ac.length+')</h3>'+(ac.length?'<table><thead><tr><th>Date</th><th>Categorie</th><th>Libelle</th><th class="text-right">Montant</th></tr></thead><tbody>'+ac.map(x=>'<tr><td class="text-muted text-sm">'+fd(x.date)+'</td><td><span class="badge bdr">'+(acCat[x.categorie]||x.categorie)+'</span></td><td>'+(x.libelle||'-')+'</td><td class="text-right">'+fm(x.montant,devDef)+'</td></tr>').join('')+'</tbody></table>':'<p class="text-muted text-sm">Aucun achat cette annee</p>')+'<div class="mt-4 pt-4 border-t border-border text-sm space-y-1">'+Object.entries(byCat).map(([k,v])=>'<div class="flex justify-between"><span class="text-muted">'+(acCat[k]||k)+'</span><span>'+fm(v,devDef)+'</span></div>').join('')+'<div class="flex justify-between font-semibold pt-1"><span>Total</span><span>'+fm(totAch,devDef)+'</span></div></div></div></div>';
}

/* --- Export PDF du bilan --- */
async function expBilanPdf(year){
  if(!window.html2canvas||!window.jspdf){toast('PDF indisponible : bibliotheques non chargees (verifiez la connexion internet)','error');return}
  const fc=gd(K.fc).filter(f=>yrOf(f.date)===year),ac=gd(K.ac).filter(x=>yrOf(x.date)===year),cl=gd(K.cl),st=gSt();
  const htByDev=sumByDev(fc,'totalHT'),tvaByDev=sumByDev(fc,'totalTVA'),ttcByDev=sumByDev(fc,'totalTTC');
  const encByDev=sumByDev(fc.filter(f=>f.statut==='payee'),'totalTTC');
  const totAch=ac.reduce((s,x)=>s+(parseFloat(x.montant)||0),0),devDef=st.devise||'CHF';
  const method=st.tvaMethode==='encaissee'?'encaissee':'facturee';
  const q=calcTvaTrimestres(year,method);
  const byCat={};ac.forEach(x=>{byCat[x.categorie]=(byCat[x.categorie]||0)+(parseFloat(x.montant)||0)});
  const row=(a,b,bold)=>'<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;'+(bold?'font-weight:700;border-top:1px solid #ddd;margin-top:4px;padding-top:8px':'color:#555')+'"><span>'+a+'</span><span>'+b+'</span></div>';
  const html='<div style="width:800px;padding:50px;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;background:#fff">'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:30px"><div><div style="font-size:22px;font-weight:700">'+(st.nom||'')+'</div><div style="font-size:12px;color:#666;margin-top:4px">'+(st.adresse||'')+'</div></div><div style="text-align:right"><div style="font-size:28px;font-weight:700;color:#E8A832">BILAN '+year+'</div><div style="font-size:11px;color:#999;margin-top:4px">Genere le '+fd(td())+'</div></div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:30px">'
      +'<div style="background:#f8f7f4;border-radius:10px;padding:16px"><div style="font-size:10px;text-transform:uppercase;color:#999;margin-bottom:6px">CA facture HT</div><div style="font-size:18px;font-weight:700">'+fmMulti(htByDev)+'</div></div>'
      +'<div style="background:#f8f7f4;border-radius:10px;padding:16px"><div style="font-size:10px;text-transform:uppercase;color:#999;margin-bottom:6px">Encaisse</div><div style="font-size:18px;font-weight:700">'+fmMulti(encByDev)+'</div></div>'
      +'<div style="background:#f8f7f4;border-radius:10px;padding:16px"><div style="font-size:10px;text-transform:uppercase;color:#999;margin-bottom:6px">Achats / charges</div><div style="font-size:18px;font-weight:700">'+fm(totAch,devDef)+'</div></div>'
      +'<div style="background:#f8f7f4;border-radius:10px;padding:16px"><div style="font-size:10px;text-transform:uppercase;color:#999;margin-bottom:6px">Resultat</div><div style="font-size:18px;font-weight:700">'+fm((encByDev[devDef]||Object.values(encByDev)[0]||0)-totAch,Object.keys(encByDev)[0]||devDef)+'</div></div>'
    +'</div>'
    +'<div style="margin-bottom:24px"><div style="font-size:14px;font-weight:700;margin-bottom:8px">TVA a reverser (methode : '+(method==='encaissee'?'contre-encaissement':'contre-prestations facturees')+')</div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid #E8A832"><th style="text-align:left;padding:6px 0;color:#999;font-size:10px;text-transform:uppercase">Periode</th><th style="text-align:right;padding:6px 0;color:#999;font-size:10px;text-transform:uppercase">CA HT</th><th style="text-align:right;padding:6px 0;color:#999;font-size:10px;text-transform:uppercase">TVA collectee</th></tr></thead><tbody>'
      +q.map((x,i)=>'<tr style="border-bottom:1px solid #eee"><td style="padding:6px 0">T'+(i+1)+' '+year+'</td><td style="padding:6px 0;text-align:right">'+fm(x.ht,devDef)+'</td><td style="padding:6px 0;text-align:right">'+fm(x.tva,devDef)+'</td></tr>').join('')
      +'<tr><td style="padding:8px 0;font-weight:700">Total annuel</td><td style="padding:8px 0;text-align:right;font-weight:700">'+fm(q.reduce((s,x)=>s+x.ht,0),devDef)+'</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#E8A832">'+fm(q.reduce((s,x)=>s+x.tva,0),devDef)+'</td></tr>'
      +'</tbody></table>'
      +'<div style="font-size:10px;color:#999;margin-top:6px">Estimation indicative, ne remplace pas le decompte officiel aupres de l\'AFC.</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">'
      +'<div><div style="font-size:14px;font-weight:700;margin-bottom:8px">Factures ('+fc.length+')</div>'+row('Total HT',fmMulti(htByDev))+row('Total TVA',fmMulti(tvaByDev))+row('Total TTC',fmMulti(ttcByDev),true)+row('Encaisse',fmMulti(encByDev))+'</div>'
      +'<div><div style="font-size:14px;font-weight:700;margin-bottom:8px">Achats ('+ac.length+') par categorie</div>'+Object.entries(byCat).map(([k,v])=>row(acCat[k]||k,fm(v,devDef))).join('')+row('Total',fm(totAch,devDef),true)+'</div>'
    +'</div>'
    +'<div style="margin-top:40px;text-align:center;font-size:10px;color:#bbb">'+(st.nom||'')+' - Bilan '+year+'</div>'
    +'</div>';
  const ct=document.createElement('div');ct.innerHTML=html;ct.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(ct);
  try{
    toast('Generation PDF...','info');
    const canvas=await html2canvas(ct.firstElementChild,{scale:2,useCORS:true,backgroundColor:'#fff'});
    const img=canvas.toDataURL('image/jpeg',0.95);
    const{jsPDF}=window.jspdf;const pdf=new jsPDF('p','mm','a4');
    const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
    const iw=pw-20,ih=canvas.height*iw/canvas.width;
    let y=10,hl=ih;pdf.addImage(img,'JPEG',10,y,iw,ih);hl-=(ph-20);
    while(hl>0){y=hl-ih+10;pdf.addPage();pdf.addImage(img,'JPEG',10,y,iw,ih);hl-=(ph-20)}
    pdf.save('bilan_'+year+'.pdf');
    toast('PDF exporte','success');
  }catch(e){toast('Erreur PDF','error');console.error(e)}
  finally{document.body.removeChild(ct)}
}
