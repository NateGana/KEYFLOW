// Synthesised piano: a few oscillators per note with a quick attack and natural decay.
const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const nameOf=m=>NAMES[m%12]+(Math.floor(m/12)-1);
const KFAudio=(()=>{
  let ctx,master,vol=0.7,sustain=false;
  const voices={},pending=new Set();
  const init=()=>{ // browsers only allow audio after a user gesture
    if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination)}
    if(ctx.state==='suspended')ctx.resume();
  };
  const release=m=>{
    const v=voices[m];if(!v)return;delete voices[m];
    const t=ctx.currentTime;v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(Math.max(v.g.gain.value,0.0002),t);
    v.g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);v.o.forEach(o=>o.stop(t+0.4));
  };
  function start(m){
    init();if(voices[m])release(m);pending.delete(m);
    const f=440*Math.pow(2,(m-69)/12),t=ctx.currentTime,g=ctx.createGain();
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.5,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.12,t+0.6);g.gain.exponentialRampToValueAtTime(0.0001,t+4);
    g.connect(master);
    const o=[['triangle',1,1],['sine',2,.35],['sine',3,.12]].map(([type,mul,amp])=>{
      const osc=ctx.createOscillator(),a=ctx.createGain();osc.type=type;osc.frequency.value=f*mul;a.gain.value=amp;
      osc.connect(a);a.connect(g);osc.start(t);osc.stop(t+4.2);return osc});
    voices[m]={o,g};
  }
  function stop(m){if(!ctx)return;if(sustain)pending.add(m);else release(m)}
  return{
    start,stop,init,
    setVolume(v){vol=v;if(master)master.gain.value=v},
    setSustain(on){sustain=on;if(!on){pending.forEach(release);pending.clear()}},
    click(accent){init();const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.06)}
  };
})();
