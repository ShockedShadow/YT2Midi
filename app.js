// YT2Midi - Direct Visual Dictionary Mapping Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Direct dictionary mapping standard MIDI piano keys to your exact Roblox visual layout
    const exactRobloxMap = {
        // Octave 1-2 (Lower Register)
        36: '1', 37: '2', 38: '3', 39: '4', 40: '5', 41: '6', 42: '7', 43: '8', 44: '9', 45: '0',
        46: 'q', 47: 'w', 48: 'e', 49: 'r', 50: 't', 51: 'y', 52: 'u', 53: 'i', 54: 'o', 55: 'p',
        // Octave 3-4 (Middle Register)
        56: 'a', 57: 's', 58: 'd', 59: 'f', 60: 'g', 61: 'h', 62: 'j', 63: 'k', 64: 'l',
        65: 'z', 66: 'x', 67: 'c', 68: 'v', 69: 'b', 70: 'n', 71: 'm',
        // Octave 5-6 (Upper Register & Modifiers)
        72: 'u', 73: 'o', 74: 'p', 75: 's', 76: 'f', 77: 'h', 78: 'j',
        79: '1', 81: '3', 83: '4', 85: '6', 87: '8', 88: '9', 89: 'q', 91: 'e', 93: 't'
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);
                
                let notesByTime = {};

                // Parse all tracks using the dictionary map
                midi.tracks.forEach(track => {
                    track.notes.forEach(note => {
                        let midiNote = note.midi;

                        // Bring deep bass or high treble notes safely into the mapped lookup range
                        while (midiNote < 36) midiNote += 12;
                        while (midiNote > 93) midiNote -= 12;

                        const mappedChar = exactRobloxMap[midiNote];

                        // Quantize timestamps into 0.05s steps to capture clean chords
                        const timeKey = Math.round(note.time * 20) / 20;

                        if (!notesByTime[timeKey]) {
                            notesByTime[timeKey] = [];
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

                // Format text neatly into chunks of 16 for easy in-game copy-pasting
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No notes were matched. Try uploading a different solo piano MIDI file.";
                outputSection.classList.remove('hidden');

            } catch (err) {
                console.error(err);
                alert('Error parsing the MIDI file.');
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
