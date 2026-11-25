# KEYFLOW — Piano Studio (core build)

A browser piano learning app in plain HTML, CSS and JavaScript. No backend, no dependencies.

## Run it
1. Unzip and open the `KEYFLOW` folder in VS Code.
2. Install the "Live Server" extension, right-click `index.html` → **Open with Live Server**.
(Opening `index.html` directly also works.)

## What is included
- Virtual piano: 2 octaves, mouse/touch/computer keyboard, polyphony, sustain, volume, octave switch.
- Learn Piano: 6 lessons (middle C, black keys, scales, a chord) with key highlighting and completion tracking.
- Games: Note Rush (30/60/90s), Key Finder, Melody Memory.
- Song Library: 3 original melodies with playback, speed control, practice mode and a metronome.
- Dashboard, progress stats, 7 achievements, settings (name, goal, reset).

Progress is saved in your browser's localStorage. Reset it under Settings. Practice time is estimated from the gaps between notes you play.

## Controls
White keys `A S D F G H J K L ; '`, black keys `W E T Y U O P`, `Z`/`X` octave, `Space` sustain.

## Notes
- Sound is synthesised with the Web Audio API and will not sound identical to an acoustic piano. Browsers start audio only after your first click or key press.
- All melodies are original to this project.
- Not yet included: Falling Notes, Chord Challenge, Rhythm Challenge, recording, MIDI import, theory pages, charts.
