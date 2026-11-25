// Renders the keyboard and handles mouse, touch and computer-keyboard input.
const Piano=(()=>{
  let base=4,root;const WHITE=[0,2,4,5,7,9,11],down=new Set(),keyEls={},typed={};
  const api={mode:null,onPress:null,get base(){return base}};
  const SPAN=2,start=()=>12*(base+1);
  // Computer keyboard: semitone offsets from the lowest C.
  const MAP={a:0,s:2,d:4,f:5,g:7,h:9,j:11,k:12,l:14,';':16,"'":17,w:1,e:3,t:6,y:8,u:10,o:13,p:15};
  function build(){
    root.innerHTML='';Object.keys(keyEls).forEach(k=>delete keyEls[k]);
    const w=100/(SPAN*7+1);let wi=0;
    for(let i=0;i<=SPAN*12;i++){
      const m=start()+i,pc=i%12,el=document.createElement('div'),white=WHITE.includes(pc);
      el.className='key '+(white?'white':'black');el.dataset.m=m;
      if(white){el.style.left=wi*w+'%';el.style.width=w+'%';el.innerHTML='<span>'+nameOf(m)+'</span>';wi++}
      else{el.style.left=(wi*w-w*.3)+'%';el.style.width=(w*.6)+'%'}
      keyEls[m]=el;root.appendChild(el);
    }
    document.getElementById('octLabel').textContent='C'+base;
  }
  function press(m){
    if(down.has(m))return;down.add(m);KFAudio.start(m);
    keyEls[m]&&keyEls[m].classList.add('on');
    api.onPress&&api.onPress(m);api.mode&&api.mode(m);
  }
  function release(m){
    if(!down.delete(m))return;KFAudio.stop(m);keyEls[m]&&keyEls[m].classList.remove('on');
  }
  api.render=el=>{
    root=el;build();
    root.addEventListener('pointerdown',e=>{const k=e.target.closest('.key');if(!k)return;e.preventDefault();
      const m=+k.dataset.m;press(m);
      const up=()=>{release(m);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};
      addEventListener('pointerup',up);addEventListener('pointercancel',up)});
    addEventListener('keydown',e=>{
      if(e.repeat||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      const k=e.key.toLowerCase();
      if(k==='z')return api.setBase(base-1);if(k==='x')return api.setBase(base+1);
      if(k in MAP){const m=start()+MAP[k];typed[k]=m;press(m)}
    });
    addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(typed[k]!=null){release(typed[k]);delete typed[k]}});
  };
  api.setBase=b=>{base=Math.max(1,Math.min(6,b));build()};
  api.hl=(m,c)=>keyEls[m]&&keyEls[m].classList.add(c);
  api.unhl=(m,c)=>keyEls[m]&&keyEls[m].classList.remove(c);
  api.clearHL=()=>Object.values(keyEls).forEach(e=>e.classList.remove('target','good','play'));
  return api;
})();
