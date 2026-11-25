// Mini-games. Each one takes over Piano.mode while it runs and clears it when done.
const Games=(()=>{
  let timers=[],tick=null;
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  function stop(){timers.forEach(clearTimeout);timers=[];clearInterval(tick);Piano.mode=null;Piano.clearHL()}
  function playNote(m,ms){KFAudio.start(m);Piano.hl(m,'play');later(()=>{KFAudio.stop(m);Piano.unhl(m,'play')},ms)}
  function best(key,v){const s=KFStore.get();if(v>(s.best[key]||0)){s.best[key]=v;KFStore.save()}}
  const over=(box,title,lines,again)=>{
    Piano.mode=null;clearInterval(tick);
    box.innerHTML=`<div class="card"><h2>${title}</h2>${lines.map(l=>`<p>${l}</p>`).join('')}<button class="btn" id="again">Play again</button></div>`;
    box.querySelector('#again').onclick=again;if(window.KFCheck)KFCheck();
  };

  function noteRush(box,secs){
    stop();let t=secs,score=0,ok=0,bad=0,streak=0,target;
    const NAT=['C','D','E','F','G','A','B'],SH=['C#','D#','F#','G#','A#'];
    const next=()=>{target=rnd(t>secs/2?NAT:NAT.concat(SH));draw()};
    const draw=()=>{const acc=ok+bad?Math.round(ok/(ok+bad)*100):100;
      box.innerHTML=`<div class="row muted"><span>Score ${score}</span><span>Accuracy ${acc}%</span><span>Streak ${streak}</span><span>Time ${t}s</span></div><div class="big">${target}</div><p class="msg">Press any ${target} on the keyboard</p>`};
    Piano.mode=m=>{if(NAMES[m%12]===target){ok++;streak++;score+=10+Math.min(streak,10)}else{bad++;streak=0}next()};
    tick=setInterval(()=>{t--;if(t<=0){best('noteRush',score);const s=KFStore.get();s.best.noteRushOk=(s.best.noteRushOk||0)+ok;KFStore.save();
      over(box,'Time is up',[`Score: <b>${score}</b>`,`Correct ${ok} · Wrong ${bad} · Accuracy ${ok+bad?Math.round(ok/(ok+bad)*100):0}%`],()=>noteRush(box,secs))}else draw()},1000);
    next();
  }

  function keyFinder(box){
    stop();let r=0,score=0,target,locked=false;
    const next=()=>{Piano.clearHL();if(r>=10){best('keyFinder',score);return over(box,'Round complete',[`Score: <b>${score}</b> / 100`],()=>keyFinder(box))}
      do{target=Piano.base*12+12+Math.floor(Math.random()*(r<5?13:25))}while(r<5&&NAMES[target%12].includes('#'));
      r++;locked=false;box.innerHTML=`<div class="row muted"><span>Round ${r}/10</span><span>Score ${score}</span></div><div class="big">Find ${nameOf(target)}</div><p class="msg" id="fm">Press the key on the keyboard</p>`};
    Piano.mode=m=>{if(locked)return;
      if(m===target){score+=10;Piano.hl(target,'good');box.querySelector('#fm').textContent='Correct!'}
      else{Piano.hl(target,'target');box.querySelector('#fm').textContent=`That was ${nameOf(m)} — ${m<target?'go higher':'go lower'}. The blue key is ${nameOf(target)}.`}
      locked=true;later(next,1100)};
    next();
  }

  function memory(box){
    stop();const POOL=[60,62,64,65,67,69,71,72];let seq=[],score=0,idx=0;
    const status=t=>box.querySelector('#ms').textContent=t;
    const round=()=>{seq.push(rnd(POOL));Piano.mode=null;idx=0;
      box.innerHTML=`<div class="row muted"><span>Level ${seq.length}</span><span>Notes ${seq.length}</span><span>Score ${score}</span></div><div class="big">♪</div><p class="msg" id="ms">Listen…</p>`;
      seq.forEach((m,i)=>later(()=>playNote(m,380),700+i*600));
      later(()=>{status('Your turn — repeat the melody');
        Piano.mode=m=>{if(m===seq[idx]){idx++;if(idx===seq.length){score+=seq.length*10;Piano.mode=null;status('Nice!');later(round,900)}}
          else{best('memory',seq.length-1);over(box,'Game over',[`You cleared <b>${seq.length-1}</b> round(s).`,`Score: <b>${score}</b>`],()=>memory(box))}}},700+seq.length*600);
    };
    round();
  }

  // Step-by-step follower used by lessons and song practice.
  function follow(seq,onStep,onDone){
    stop();let i=0;Piano.hl(seq[0],'target');
    Piano.mode=m=>{if(m!==seq[i])return onStep(i,false);
      Piano.clearHL();i++;if(i>=seq.length){Piano.mode=null;return onDone()}Piano.hl(seq[i],'target');onStep(i,true)};
  }
  function playSong(song,speed,onEnd){
    stop();const beat=60000/song.tempo/speed;let t=300;
    song.notes.forEach(([m,b])=>{const at=t;later(()=>playNote(m,b*beat*.9),at);t+=b*beat});
    later(()=>onEnd&&onEnd(),t);
  }
  return{noteRush,keyFinder,memory,follow,playSong,stop};
})();
