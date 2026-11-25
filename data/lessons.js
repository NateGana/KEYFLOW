// Each lesson is a note sequence the learner plays in order (MIDI numbers, Middle C = 60).
const LESSONS=[
 {id:'middlec',level:'Level 1 — Fundamentals',title:'Find Middle C',text:'White keys repeat in a pattern. Middle C (C4) sits just left of a pair of black keys, near the centre of the keyboard. The keyboard starts on it by default.',notes:[60]},
 {id:'cmajor',level:'Level 2 — Scales',title:'C Major Scale',text:'C D E F G A B C — all white keys. Right-hand fingering: 1 2 3 1 2 3 4 5.',notes:[60,62,64,65,67,69,71,72]},
 {id:'gmajor',level:'Level 2 — Scales',title:'G Major Scale',text:'G A B C D E F# G. The only black key is F#. Fingering: 1 2 3 1 2 3 4 5.',notes:[67,69,71,72,74,76,78,79]},
 {id:'aminor',level:'Level 2 — Scales',title:'A Minor Scale (natural)',text:'A B C D E F G A — same white keys as C major, but starting on A for a darker sound.',notes:[69,71,72,74,76,77,79,81]},
 {id:'chord',level:'Level 3 — Chords',title:'C Major Chord (broken)',text:'C major is C + E + G. Play it one note at a time, then try all three together in free play.',notes:[60,64,67,72]},
 {id:'sharps',level:'Level 1 — Fundamentals',title:'Meet the Black Keys',text:'Black keys are sharps (#) or flats (♭). C#, D#, F#, G# and A# each sit between two white keys.',notes:[61,63,66,68,70]}
];
