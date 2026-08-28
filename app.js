// YT2Midi - Optimized 88-Key MIDI Parser Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Exact mapping matching your 88-key layout (Transposition = 0)
    const robloxNotesMap = {
        21: '1', 22: '3', 23: '4', 24: '6', 25: '8', 26: '9',
        27: 'q', 28: 'e', 29: 't', 30: '!', 31: '@', 32: '$',
        33: '%', 34: '^', 35: '*', 36: '(', 37: 'Q', 38: 'W', 39: 'E',
        40: 'R', 41: 'T', 42: 'Y', 43: 'U', 44: 'I', 45: 'O', 46: 'P',
        47: 'S', 48: 'D', 49: 'F', 50: 'G', 51: 'H', 52: 'J', 53: 'K',
        54: 'L', 55: 'Z', 56: 'X', 57: 'C', 58: 'V', 59: 'B', 60: 'N',
        61: '1', 62: '2', 63: '3', 64: '4', 65: '5', 66: '6', 67: '7',
        68: '8', 69: '9', 70: '0', 71: 'q', 72: 'w', 73: 'e', 74: 'r',
        75: 't', 76: 'y', 77: 'u', 78: 'i', 79: 'o', 80: 'p', 81: 'a',
        82: 's', 83: 'd', 84: 'f', 85: 'g', 86: 'h', 87: 'j', 88: 'k',
        89: 'l', 90: 'z', 91: 'x', 92: 'c', 93: 'v', 94: 'b', 95: 'n',
        96: 'm', 97: 'u', 98: 'o', 99: 'p', 100: 's', 101: 'f', 102: 'h',
        103: 'j', 104: 'y', 105: 'i', 106: 'a', 107: 'd', 108: 'g'
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);
                
                let sheetResult = '';
                let notesByTime = {};

                // Find the track with the most notes (usually the primary melody track)
                // This prevents background drums or multi-channel clutter from ruining the sheet.
                let activeTrack = midi.tracks[0];
                let maxNotes = 0;
                
                midi.tracks.forEach(track => {
                    if (track.notes.length > maxNotes) {
                        maxNotes = track.notes.length;
                        activeTrack = track;
                    }
                });

                if (!activeTrack || activeTrack.notes.length === 0) {
                    sheetOutput.value = "Error: No notes found in this MIDI track.";
                    outputSection.classList.remove('hidden');
                    return;
                }

                // Map notes based on precise timing quantization (50ms window for chord accuracy)
                activeTrack.notes.forEach(note => {
                    const timeKey = Math.round(note.time * 20) / 20; 
                    if (!notesByTime[timeKey]) {
                        notesByTime[timeKey] = [];
                    }
                    if (robloxNotesMap[note.midi]) {
                        // Prevent duplicate keys inside the exact same chord tick
                        if (!notesByTime[timeKey].includes(robloxNotesMap[note.midi])) {
                            notesByTime[timeKey].push(robloxNotesMap[note.midi]);
                        }
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

                // Format nicely into 16 chords per line
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No mappable piano notes found within the 88-key range.";
                outputSection.classList.remove('hidden');

            }Cry catch (err) {
                console.error(err);
                alert('Error parsing the MIDI file. Make sure it is a valid .mid file.');
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
