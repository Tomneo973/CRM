// js/core/utils.js
const K={cl:'crm_cl',dv:'crm_dv',fc:'crm_fc',pj:'crm_pj',rt:'crm_rt',vl:'crm_vl',sg:'crm_sg',st:'crm_st',ac:'crm_ac'};
const uid=()=>Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
const gd=k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}};
const sd=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const gs=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}};
const ss=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const gSt=()=>gs(K.st);
const fm=(n,c)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:c||'EUR'}).format(n||0);
const fm2=n=>new Intl.NumberFormat('fr-CH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0);
const fd=d=>{if(!d)return'-';const p=d.split('-');return p[2]+'/'+p[1]+'/'+p[0]};
const td=()=>new Date().toISOString().split('T')[0];
const nn=(px,a,f)=>{const y=new Date().getFullYear();const mx=Math.max(0,...a.filter(i=>(i[f]||'').includes(px+y)).map(i=>{const m=(i[f]||'').split('-');return parseInt(m[m.length-1])||0}));return px+y+'-'+String(mx+1).padStart(3,'0')};
const bsg=(s,t)=>{const m={devis:{brouillon:'bdr',envoye:'bi',accepte:'bo',refuse:'bk'},facture:{brouillon:'bdr',envoyee:'bi',payee:'bo',retard:'bk'}};const l={brouillon:'Brouillon',envoye:'Envoye',envoyee:'Envoyee',accepte:'Accepte',refuse:'Refuse',payee:'Payee',retard:'En retard'};return'<span class="badge '+(m[t]?.[s]||'bdr')+'">'+(l[s]||s)+'</span>'};
const tvxOf=it=>{if(it.tauxTVA!=null&&it.tauxTVA!=='')return parseFloat(it.tauxTVA);if(it.totalHT)return Math.round(it.totalTVA/it.totalHT*10000)/100;return gSt().tva||20};