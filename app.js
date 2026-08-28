// YT2Midi - Direct Virtual Piano / Roblox Mapping Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Standard Virtual Piano character mapping array (Covers 3 full octaves cleanly)
    // Lower case = natural keys, brackets = chords
    const vpMap = {
        // Octave 3 (Low)
        48: 'z', 50: 'x', 52: 'c', 53: 'v', 55: 'b', 57: 'n', 59: 'm',
        // Octave 4 (Middle C)
        60: '1', 62: '2', 64: '3', 65: '4', 67: '5', 69: '6', 71: '7',
        72: 't', 74: 'y', 76: 'u', 77: 'i', 79: 'o', 81: 'p', 83: 'a',
        // Octave 5 (High)
        84: 's', 86: 'd', 88: 'f', 89: 'g', 91: 'h', 93: 'j', 95: 'k'
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);
                
                let notesByTime = {};

                // Parse all tracks, pulling only notes that fit within the playable range
                midi.tracks.forEach(track => {
                    track.notes.forEach(note => {
                        let midiNote = note.midi;

                        // Shift octaves up or down if the song is out of range
                        while (midiNote < 48) midiNote += 12;
                        while (midiNote > 95) midiNote -= 12;

                        // Quantize time into 0.05s steps to capture simultaneous chords accurately
                        const timeKey = Math.round(note.time * 20) / 20;

                        if (!notesByTime[timeKey]) {
                            notesByTime[timeKey] = [];
                        }

                        // Find closest mapped note
                        let mappedChar = vpMap[midiNote];
                        if (!mappedChar) {
                            // Fallback to nearest neighbor if exact match missing
                            let keys = Object.keys(vpMap).map(Number);
                            let closest = keys.reduce((prev, curr) => Math.abs(curr - midiNote) < Math.abs(prev - midiNote) ? curr : prev);
                            mappedChar = vpMap[closest];
                        }

                        if (mappedChar && !notesByTime[timeKey].includes(mappedChar)) {
                            notesByTime[timeKey].push(mappedChar);
                        }
                    });
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

                // Format text cleanly into rows of 16 blocks
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No valid notes found.";
                outputSection.classList.remove('hidden');

            } catch (err) {
                console.error(err);
                alert('Error parsing MIDI file.');
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            sheetOutput.select();
            document.execCommand('copy');
            copyText.textContent = 'Copied!';
            setTimeout => {
                copyText.textContent = 'Copy Sheet';
            }, 2000);
        });
    }
});
