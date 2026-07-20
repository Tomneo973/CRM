function toast(msg,t='info'){const c=document.getElementById('toasts');const e=document.createElement('div');e.className='toast t'+t[0]+' pointer-events-auto';const ic={success:'fa-check-circle',error:'fa-exclamation-circle',info:'fa-info-circle'};e.innerHTML='<i class="fas '+(ic[t]||ic.info)+'"></i><span>'+msg+'</span>';c.appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transform='translateX(100%)';e.style.transition='all .3s';setTimeout(()=>e.remove(),300)},3500)}

/* Modal */
function showM(t,h){document.getElementById('mtit').textContent=t;document.getElementById('mbod').innerHTML=h;document.getElementById('mover').style.display='flex'}
function closeM(){document.getElementById('mover').style.display='none'}
