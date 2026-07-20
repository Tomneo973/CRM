const FS={
  h:null,ls:null,
  _all(){const d={};Object.values(K).forEach(k=>{try{d[k]=JSON.parse(localStorage.getItem(k))}catch(e){d[k]=null}});return d},
  _load(d){Object.entries(d).forEach(([k,v])=>{if(v!=null)localStorage.setItem(k,JSON.stringify(v))})},
  async save(){
    const j=JSON.stringify(this._all(),null,2);
    if(this.h){try{if((await this.h.queryPermission({mode:'readwrite'}))!=='granted')await this.h.requestPermission({mode:'readwrite'});const w=await this.h.createWritable();await w.write(j);await w.close();this._ok('Sauvegarde reussie');return}catch(e){this.h=null}}
    if('showSaveFilePicker' in window){try{this.h=await window.showSaveFilePicker({suggestedName:'onboard-crm.json',types:[{description:'JSON',accept:{'application/json':['.json']}}]});const w=await this.h.createWritable();await w.write(j);await w.close();this._ok('Fichier cree');return}catch(e){if(e.name!=='AbortError')toast('Erreur','error');return}}
    const b=new Blob([j],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='onboard-crm.json';a.click();this._ok('Fichier telecharge');
  },
  async load(){
    if('showOpenFilePicker' in window){try{const[h]=await window.showOpenFilePicker({types:[{description:'JSON',accept:{'application/json':['.json']}}]});this._read(await(await h.getFile()).text());this.h=h;return}catch(e){if(e.name!=='AbortError')toast('Erreur','error');return}}
    const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>this._read(ev.target.result);r.readAsText(f)}};i.click();
  },
  _read(t){try{this._load(JSON.parse(t));this.ls=new Date();updSi();toast('Donnees chargees','success');render()}catch(e){toast('JSON invalide','error')}},
  _ok(m){this.ls=new Date();updSi();toast(m,'success')}
};
function updSi(){const e=document.getElementById('sind');if(!e)return;if(FS.ls){e.textContent='Sauvegarde : '+FS.ls.toLocaleTimeString('fr-FR');e.style.color='#2ECC71'}else{e.textContent='Non sauvegarde en fichier';e.style.color='#F39C12'}}
