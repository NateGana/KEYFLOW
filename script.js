// App shell: navigation, views, progress tracking and achievements.
const $=(s,r=document)=>r.querySelector(s);
const S=()=>KFStore.get();
const ICONS={dashboard:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
 piano:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 5v14M16 5v14"/>',
 learn:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/>',
 games:'<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="12" r="1"/>',
 songs:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
 progress:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'};
const NAV=[['dashboard','Dashboard'],['piano','Virtual Piano'],['learn','Learn Piano'],['games','Piano Games'],['songs','Song Library'],['progress','My Progress'],['settings','Settings']];
const today=()=>new Date().toISOString().slice(0,10);

// ---------- achievements ----------
const ACH=[
 ['First Note','Play any note',s=>s.notes>=1],['First Lesson','Complete a lesson',s=>s.lessons.length>=1],
 ['Piano Beginner','Complete 3 lessons',s=>s.lessons.length>=3],['Chord Explorer','Finish the chord lesson',s=>s.lessons.includes('chord')],
 ['Note Master','Get 20 correct answers in Note Rush',s=>(s.best.noteRushOk||0)>=20],['Melody Memory','Clear 5 rounds of Melody Memory',s=>(s.best.memory||0)>=5],
 ['Practice Champion','Practice for 20 minutes total',s=>s.seconds>=1200]];
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
function KFCheck(){const s=S();let changed=false;
  ACH.forEach(([n,,test])=>{if(!s.achieved.includes(n)&&test(s)){s.achieved.push(n);changed=true;toast('Achievement unlocked: '+n)}});
  if(changed)KFStore.save()}
window.KFCheck=KFCheck;

// ---------- practice tracking ----------
let lastPress=0;
Piano.onPress=()=>{const s=S(),now=Date.now(),d=today();
  s.notes++;
  if(lastPress&&now-lastPress<8000){const sec=(now-lastPress)/1000;s.seconds+=sec;s.days[d]=(s.days[d]||0)+sec}
  lastPress=now;
  if(s.lastDay!==d){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);s.streak=s.lastDay===y?s.streak+1:1;s.lastDay=d}
  KFStore.save();KFCheck()};

// ---------- navigation ----------
let current='dashboard',metro=null;
function buildNav(){$('#nav').innerHTML='<div class="logo">KEY<span>FLOW</span></div>'+NAV.map(([id,l])=>
  `<button data-go="${id}"><svg class="i" viewBox="0 0 24 24">${ICONS[id]}</svg>${l}</button>`).join('')}
function go(v){Games.stop();current=v;
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===v));
  $('#view').innerHTML=VIEWS[v]();(BIND[v]||(()=>{}))();$('#view').scrollTop=0}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)});

const stat=(v,l)=>`<div class="card stat"><b>${v}</b><span>${l}</span></div>`;
const min=s=>Math.floor(s/60);

const VIEWS={
 dashboard(){const s=S(),todayMin=Math.floor((s.days[today()]||0)/60),pct=Math.min(100,Math.round(todayMin/s.goal*100));
  const last=LESSONS.find(l=>l.id===s.lastLesson);
  return `<h1>Welcome back, ${s.name}!</h1><p class="sub">Ready to play something beautiful today?</p>
  <div class="grid">${stat(min(s.seconds),'Practice minutes')}${stat(s.lessons.length,'Lessons completed')}${stat(s.songs.length,'Songs practiced')}${stat(s.streak,'Day streak')}${stat(s.best.noteRush||0,'Best Note Rush score')}${stat(s.notes,'Notes played')}</div>
  <h2>Daily goal</h2><div class="card">${todayMin} of ${s.goal} minutes today<div class="bar"><i style="width:${pct}%"></i></div></div>
  <h2>Continue learning</h2><div class="card row"><span>${last?last.title:'You have not started a lesson yet'}</span><button class="btn" data-go="learn">${last?'Continue':'Start'}</button></div>
  <h2>Recommended practice</h2><div class="grid">
   <div class="card"><b>Practice C Major Scale</b><p class="muted">Eight white keys, one finger pattern.</p><button class="btn" data-go="learn">Open</button></div>
   <div class="card"><b>Try Note Rush</b><p class="muted">Read notes faster.</p><button class="btn" data-go="games">Play</button></div>
   <div class="card"><b>Play Morning Lights</b><p class="muted">An original beginner piece.</p><button class="btn" data-go="songs">Open</button></div></div>
  <h2>Daily challenge</h2><div class="card row"><span>Beat your Note Rush best (${s.best.noteRush||0}) in 30 seconds.</span><button class="btn" data-go="games">Accept</button></div>`},
 piano(){return `<h1>Virtual Piano</h1><p class="sub">Click, touch or use your computer keyboard. Hold several keys for chords.</p>
  <div class="card"><table><tr><td class="muted">White keys</td><td>A S D F G H J K L ; '</td></tr><tr><td class="muted">Black keys</td><td>W E T Y U O P</td></tr>
  <tr><td class="muted">Octave</td><td>Z (down) · X (up)</td></tr></table></div>`},
 learn(){const levels=[...new Set(LESSONS.map(l=>l.level))].sort();
  return `<h1>Learn Piano</h1><p class="sub">Pick a lesson, then play the glowing blue keys in order.</p><div id="lesson"></div>`+
   levels.map(lv=>`<h2>${lv}</h2><div class="grid">${LESSONS.filter(l=>l.level===lv).map(l=>
    `<div class="card"><b>${l.title}</b><p class="done">${S().lessons.includes(l.id)?'Completed':''}</p><button class="btn" data-lesson="${l.id}">Start</button></div>`).join('')}</div>`).join('')},
 games(){return `<h1>Piano Games</h1><p class="sub">Start a game, then answer on the keyboard below.</p>
  <div class="row"><button class="btn ghost" data-g="n30">Note Rush 30s</button><button class="btn ghost" data-g="n60">Note Rush 60s</button><button class="btn ghost" data-g="n90">Note Rush 90s</button>
  <button class="btn ghost" data-g="kf">Key Finder</button><button class="btn ghost" data-g="mm">Melody Memory</button></div><div id="game" style="margin-top:18px"></div>`},
 songs(){return `<h1>Song Library</h1><p class="sub">Original melodies written for KEYFLOW.</p>
  <div class="row" style="justify-content:flex-start"><label class="muted">Speed <input id="spd" type="range" min="0.5" max="1" step="0.25" value="1"></label>
  <button class="btn ghost" id="metro">Metronome: off</button></div><div class="grid" style="margin-top:14px">`+
  SONGS.map((s,i)=>`<div class="card"><b>${s.title}</b><p class="muted">${s.diff} · ${s.notes.length} notes · ${s.tempo} BPM</p><p class="done">${S().songs.includes(s.title)?'Completed':''}</p>
  <div class="row" style="justify-content:flex-start"><button class="btn" data-play="${i}">Play</button><button class="btn ghost" data-prac="${i}">Practice</button></div></div>`).join('')+`</div><p class="msg" id="sm"></p>`},
 progress(){const s=S();return `<h1>My Progress</h1><p class="sub">${s.name} · ${min(s.seconds)} minutes practiced</p>
  <div class="grid">${stat(s.notes,'Notes played')}${stat(s.lessons.length+'/'+LESSONS.length,'Lessons')}${stat(s.best.noteRush||0,'Note Rush best')}${stat(s.best.keyFinder||0,'Key Finder best')}${stat(s.best.memory||0,'Memory best (rounds)')}</div>
  <h2>Achievements</h2><div class="grid">${ACH.map(([n,d])=>{const on=s.achieved.includes(n);
  return `<div class="card" style="opacity:${on?1:.45}"><b style="color:${on?'var(--gold)':'inherit'}">${n}</b><p class="muted">${d}</p></div>`}).join('')}</div>`},
 settings(){const s=S();return `<h1>Settings</h1><div class="card" style="max-width:420px;display:grid;gap:14px">
  <label>Display name<br><input type="text" id="name" value="${s.name}"></label>
  <label>Daily goal (minutes)<br><input type="number" id="goal" min="1" max="240" value="${s.goal}"></label>
  <p class="muted">Volume is set with the slider above the keyboard.</p>
  <button class="btn" id="reset" style="background:#c0475a">Reset all progress</button></div>`}
};

const BIND={
 learn(){document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{
  const l=LESSONS.find(x=>x.id===b.dataset.lesson),s=S();s.lastLesson=l.id;KFStore.save();Piano.setBase(4);
  $('#lesson').innerHTML=`<div class="card"><h2 style="margin-top:0">${l.title}</h2><p>${l.text}</p><p class="muted" id="ls">Play ${nameOf(l.notes[0])} to begin.</p></div>`;
  Games.follow(l.notes,(i,ok)=>{$('#ls').textContent=ok?`Next: ${nameOf(l.notes[i])} (${i}/${l.notes.length})`:`Not quite — look for the blue key (${nameOf(l.notes[i])}).`},
   ()=>{if(!s.lessons.includes(l.id))s.lessons.push(l.id);KFStore.save();$('#ls').textContent='Lesson complete!';toast('Lesson complete: '+l.title);KFCheck()});
  $('#lesson').scrollIntoView({behavior:'smooth'})})},
 games(){const box=$('#game');Piano.setBase(4);
  document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const g=b.dataset.g;
   if(g[0]==='n')Games.noteRush(box,+g.slice(1));else if(g==='kf')Games.keyFinder(box);else Games.memory(box)})},
 songs(){let speed=1;Piano.setBase(4);const msg=t=>$('#sm').textContent=t;
  $('#spd').oninput=e=>speed=+e.target.value;
  document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const s=SONGS[b.dataset.play];msg('Playing '+s.title+'…');Games.playSong(s,speed,()=>msg(''))});
  document.querySelectorAll('[data-prac]').forEach(b=>b.onclick=()=>{const s=SONGS[b.dataset.prac],seq=s.notes.map(n=>n[0]);
   msg('Follow the blue keys…');Games.follow(seq,(i,ok)=>msg(ok?`${i}/${seq.length}`:'Try the blue key'),()=>{
    const st=S();if(!st.songs.includes(s.title))st.songs.push(s.title);KFStore.save();msg('Song complete!');toast('Song complete: '+s.title)})});
  $('#metro').onclick=e=>{if(metro){clearInterval(metro);metro=null;e.target.textContent='Metronome: off';return}
   const bpm=SONGS[0].tempo;let n=0;metro=setInterval(()=>KFAudio.click(n++%4===0),60000/bpm);e.target.textContent=`Metronome: on (${bpm} BPM)`}},
 settings(){$('#name').onchange=e=>{S().name=e.target.value||'Musician';KFStore.save()};
  $('#goal').onchange=e=>{S().goal=Math.max(1,+e.target.value||20);KFStore.save()};
  $('#reset').onclick=()=>{if(confirm('Reset all saved progress? This cannot be undone.')){KFStore.reset();go('settings')}}}
};

// ---------- start-up ----------
Piano.render($('#piano'));
const vol=$('#vol');vol.value=S().volume;KFAudio.setVolume(S().volume);
vol.oninput=()=>{KFAudio.setVolume(+vol.value);S().volume=+vol.value;KFStore.save()};
$('#octDown').onclick=()=>Piano.setBase(Piano.base-1);$('#octUp').onclick=()=>Piano.setBase(Piano.base+1);
$('#sustain').onclick=e=>{const on=!e.target.classList.contains('on');e.target.classList.toggle('on',on);KFAudio.setSustain(on)};
addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|BUTTON/.test(e.target.tagName)){e.preventDefault();$('#sustain').click()}});
buildNav();go('dashboard');
