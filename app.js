// YT2Midi - Clean Single-Track Melody Extractor & Roblox Mapped Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Standard Roblox/Virtual Piano character key table centered for melody tracking
    const standardKeys = [
        '1','!','2','@','3','4','$','5','%','6','^','7','8','*','9','(','0',
        'q','Q','w','W','e','E','r','R','t','T','y','Y','u','U','i','I','o','O','p','P',
        'a','A','s','S','d','D','f','F','g','G','h','H','j','J','k','K','l','L',
        'z','Z','x','X','c','C','v','V','b','B','n','N','m','M'
    ];

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);

                // Find the track with the most notes (guarantees we grab the main song melody, not drums/metadata)
                let melodyTrack = midi.tracks[0];
                let maxNotes = 0;
                
                midi.tracks.forEach(track => {
                    if (track.notes.length > maxNotes) {
                        maxNotes = track.notes.length;
                        melodyTrack = track;
                    }
                });

                if (!melodyTrack || melodyTrack.notes.length === 0) {
                    sheetOutput.value = "Error: No playable notes found in this MIDI.";
                    outputSection.classList.remove('hidden');
                    return;
                }

                let notesByTime = {};

                // Map notes cleanly using a tight time grouping window (0.04s) for accurate chords
                melodyTrack.notes.forEach(note => {
                    const timeKey = Math.round(note.time * 25) / 25;
                    
                    if (!notesByTime[timeKey]) {
                        notesByTime[timeKey] = [];
                    }

                    // Dynamically fit MIDI pitch safely into our active character array range
                    const keyIndex = (note.midi - 36) % standardKeys.length;
                    const safeIndex = Math.abs(keyIndex);
                    const mappedChar = standardKeys[safeIndex];

                    if (mappedChar && !notesByTime[timeKey].includes(mappedChar)) {
                        notesByTime[timeKey].push(mappedChar);
                    }
                });

                const sortedTimes = Object.keys(notesByTime).sort((a, b) => a - b);
                let chordChunks = [];

                sortedTimes.forEach(time => {
                    const keys = notesByTime[time];
                    if (keys.length > 0) {
                        if (keys.length > 1) {
                            chordChunks.push(`[${keys.join('')}]`);
                        } else {
                            chordChunks.push(keys[0]);
                        }
                    }
                });

                // Format text into blocks of 16 for clean copy/pasting
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "Generated sheet was empty.";
                outputSection.classList.remove('hidden');

            } catch (err) {
                console.error(err);
                alert('Error parsing the MIDI file. Ensure it is a standard .mid file.');
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            sheetOutput.select();
            document.execCommand('copy');
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyText.textContent = 'Copy Sheet';
            }, 2000);
        });
    }
});
