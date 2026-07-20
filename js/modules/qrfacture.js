/* === QR-FACTURE (Swiss QR-bill) === */
if(window.qrcode)qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];
function ibanClean(v){return(v||'').replace(/\s+/g,'').toUpperCase()}
function ibanValid(v){
  const iban=ibanClean(v);
  if(!/^[A-Z0-9]{15,34}$/.test(iban))return false;
  const r=iban.slice(4)+iban.slice(0,4);
  const num=r.split('').map(ch=>{const c=ch.charCodeAt(0);return(c>=65&&c<=90)?(c-55):ch}).join('');
  let rem=0;for(let i=0;i<num.length;i++){rem=(rem*10+parseInt(num[i],10))%97}
  return rem===1;
}
function isQrIban(v){const iban=ibanClean(v);if(!/^(CH|LI)/.test(iban))return false;const clr=parseInt(iban.slice(4,9),10);return clr>=30000&&clr<=31999}
function fmtIban(v){return ibanClean(v).replace(/(.{4})/g,'$1 ').trim()}
function fmtRef(v){return(v||'').replace(/(.{5})/g,'$1 ').trim()}
function mod10Check(digits){
  const T=[[0,9,4,6,8,2,7,1,3,5],[9,4,6,8,2,7,1,3,5,0],[4,6,8,2,7,1,3,5,0,9],[6,8,2,7,1,3,5,0,9,4],[8,2,7,1,3,5,0,9,4,6],[2,7,1,3,5,0,9,4,6,8],[7,1,3,5,0,9,4,6,8,2],[1,3,5,0,9,4,6,8,2,7],[3,5,0,9,4,6,8,2,7,1],[5,0,9,4,6,8,2,7,1,3]];
  let carry=0;for(const d of String(digits))carry=T[carry][parseInt(d,10)];
  return(10-carry)%10;
}
function genQRR(numero){const d=(numero||'').replace(/\D/g,'').slice(-26).padStart(26,'0');return d+mod10Check(d)}
function buildSPC(item,type,cl,st){
  const iban=ibanClean(st.iban);
  if(!iban)return null;
  const L=[];
  L.push('SPC','0200','1',iban);
  L.push('S',st.titulaire||st.nom||'',st.rue||'',st.rueNo||'',st.npa||'',st.ville||'',(st.pays||'CH').toUpperCase());
  L.push('','','','','','','');
  const amt=(item.totalTTC||0).toFixed(2),dev=item.devise||st.devise||'CHF';
  L.push(amt,dev);
  const hasDebtor=!!(cl&&cl.rue&&cl.npa&&cl.ville);
  if(hasDebtor)L.push('S',cl.nom||'',cl.rue||'',cl.rueNo||'',cl.npa||'',cl.ville||'',(cl.pays||'CH').toUpperCase());
  else L.push('','','','','','','');
  const qrIban=isQrIban(iban),refType=qrIban?'QRR':'NON',ref=qrIban?genQRR(item.numero):'';
  L.push(refType,ref);
  let msg=(type==='devis'?'Devis ':'Facture ')+(item.numero||'')+(type==='devis'?' - offre, ne constitue pas une facture':'');
  L.push(msg.slice(0,140));
  L.push('EPD');
  return L.join('\n');
}
function qrBillHTML(item,type,cl,st){
  const spc=buildSPC(item,type,cl,st);
  if(!spc||!window.qrcode)return null;
  const qr=qrcode(0,'M');qr.addData(spc,'Byte');qr.make();
  const qrImgSrc=qr.createDataURL(8,16);
  const qrImg='<img src="'+qrImgSrc+'" style="display:block;width:100%;height:100%;image-rendering:pixelated" alt="QR-facture">';
  const iban=ibanClean(st.iban),cName=st.titulaire||st.nom||'';
  const cAddr=[((st.rue||'')+' '+(st.rueNo||'')).trim(),((st.npa||'')+' '+(st.ville||'')).trim()].filter(x=>x).join('<br>');
  const amt=fm2(item.totalTTC),dev=item.devise||st.devise||'CHF';
  const qrIban=isQrIban(iban),ref=qrIban?fmtRef(genQRR(item.numero)):'';
  const hasDebtor=!!(cl&&cl.rue&&cl.npa&&cl.ville);
  const dAddr=hasDebtor?((cl.nom||'')+'<br>'+(cl.rue||'')+' '+(cl.rueNo||'')+'<br>'+(cl.npa||'')+' '+(cl.ville||'')):'';
  const isDevis=type==='devis';
  const msg=isDevis?'Devis '+item.numero+' - offre, ne constitue pas une facture':'Facture '+item.numero;
  const watermark=isDevis?'<div style="position:absolute;top:38%;left:28%;transform:translate(-50%,-50%) rotate(-22deg);font-size:26pt;font-weight:800;color:rgba(190,30,30,.15);letter-spacing:3px;pointer-events:none;white-space:nowrap;z-index:2;">PROVISOIRE</div>':'';
  return'<div style="position:relative;width:210mm;min-height:105mm;display:flex;background:#fff;color:#000;font-family:Helvetica,Arial,sans-serif;border-top:1px solid #000;box-sizing:border-box;overflow:hidden;">'
    +watermark
    +'<div style="position:absolute;top:-3.8mm;left:5mm;font-size:11pt;">&#9986;</div>'
    +'<div style="width:62mm;padding:5mm;box-sizing:border-box;border-right:1px dashed #000;display:flex;flex-direction:column;">'
      +'<div style="font-size:11pt;font-weight:700;margin-bottom:4mm;">Recepisse</div>'
      +'<div style="font-size:6pt;font-weight:700;">Compte / Payable a</div>'
      +'<div style="font-size:8pt;line-height:1.35;margin-bottom:2mm;">'+fmtIban(iban)+'<br>'+cName+(cAddr?'<br>'+cAddr:'')+'</div>'
      +(ref?'<div style="font-size:6pt;font-weight:700;">Reference</div><div style="font-size:8pt;margin-bottom:2mm;">'+ref+'</div>':'')
      +'<div style="font-size:6pt;font-weight:700;">Payable par'+(hasDebtor?'':' (nom/adresse)')+'</div>'
      +'<div style="font-size:8pt;line-height:1.35;min-height:8mm;">'+dAddr+'</div>'
      +'<div style="flex:1"></div>'
      +'<div style="display:flex;gap:6mm;margin-top:2mm;"><div><div style="font-size:6pt;font-weight:700;">Monnaie</div><div style="font-size:8pt;">'+dev+'</div></div><div><div style="font-size:6pt;font-weight:700;">Montant</div><div style="font-size:8pt;">'+amt+'</div></div></div>'
      +'<div style="text-align:right;font-size:6pt;font-weight:700;margin-top:4mm;">Point de depot</div>'
    +'</div>'
    +'<div style="width:148mm;padding:5mm;box-sizing:border-box;display:flex;gap:5mm;">'
      +'<div style="width:51mm;flex-shrink:0;">'
        +'<div style="font-size:11pt;font-weight:700;margin-bottom:4mm;">Section paiement</div>'
        +'<div style="width:46mm;height:46mm;position:relative;">'+qrImg
          +'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7mm;height:7mm;background:#fff;border:0.5mm solid #000;display:flex;align-items:center;justify-content:center;"><div style="position:relative;width:5mm;height:5mm;"><div style="position:absolute;top:50%;left:0;width:100%;height:1.3mm;background:#000;transform:translateY(-50%);"></div><div style="position:absolute;left:50%;top:0;height:100%;width:1.3mm;background:#000;transform:translateX(-50%);"></div></div></div>'
        +'</div>'
        +'<div style="display:flex;gap:5mm;margin-top:4mm;"><div><div style="font-size:8pt;font-weight:700;">Monnaie</div><div style="font-size:10pt;">'+dev+'</div></div><div><div style="font-size:8pt;font-weight:700;">Montant</div><div style="font-size:10pt;">'+amt+'</div></div></div>'
      +'</div>'
      +'<div style="flex:1;padding-top:11mm;">'
        +'<div style="font-size:8pt;font-weight:700;">Compte / Payable a</div>'
        +'<div style="font-size:10pt;line-height:1.4;margin-bottom:3mm;">'+fmtIban(iban)+'<br>'+cName+(cAddr?'<br>'+cAddr:'')+'</div>'
        +(ref?'<div style="font-size:8pt;font-weight:700;">Reference</div><div style="font-size:10pt;margin-bottom:3mm;">'+ref+'</div>':'')
        +'<div style="font-size:8pt;font-weight:700;">Informations supplementaires</div>'
        +'<div style="font-size:10pt;margin-bottom:3mm;">'+msg+'</div>'
        +'<div style="font-size:8pt;font-weight:700;">Payable par'+(hasDebtor?'':' (nom/adresse)')+'</div>'
        +'<div style="font-size:10pt;line-height:1.4;min-height:10mm;">'+dAddr+'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function previewQR(type,id){
  const item=gd(type==='devis'?K.dv:K.fc).find(x=>x.id===id);if(!item)return;
  const cl=gd(K.cl).find(x=>x.id===item.clientId),st=gSt();
  if(st.qrEnabled===false){toast('QR-facture desactivee dans Parametres','error');return}
  if(!st.iban){toast('Configurez d\'abord vos coordonnees bancaires dans Parametres > QR-facture','error');return}
  if(!ibanValid(st.iban)){toast('IBAN configure invalide, verifiez-le dans Parametres','error');return}
  const html=qrBillHTML(item,type,cl,st);
  if(!html){toast('Impossible de generer la QR-facture','error');return}
  showM('Apercu QR-facture','<div style="overflow-x:auto;background:#e5e5e5;padding:16px;border-radius:8px;"><div style="transform:scale(0.85);transform-origin:top left;width:210mm;">'+html+'</div></div><p class="text-xs text-muted mt-3">Rendu indicatif redimensionne pour l\'aperçu - le PDF exporte respecte les dimensions officielles exactes.</p>');
}
