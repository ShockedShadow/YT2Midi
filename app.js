// Exact 88-Key Roblox Piano QWERTY Mapping Engine (Transposition = 0)
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Exact mapping derived directly from your provided in-game screenshot layout
    const robloxNotesMap = {
        // --- Octave 1 (Lowest) ---
        21: '1', 22: '3', 23: '4', 24: '6', 25: '8', 26: '9',
        27: 'q', 28: 'e', 29: 't', 30: '!', 31: '@', 32: '$',
        // --- Octave 2 ---
        33: '%', 34: '^', 35: '*', 36: '(', 37: 'Q', 38: 'W', 39: 'E',
        40: 'R', 41: 'T', 42: 'Y', 43: 'U', 44: 'I', 45: 'O', 46: 'P',
        // --- Octave 3 ---
        47: 'S', 48: 'D', 49: 'F', 50: 'G', 51: 'H', 52: 'J', 53: 'K',
        54: 'L', 55: 'Z', 56: 'X', 57: 'C', 58: 'V', 59: 'B', 60: 'N',
        // --- Octave 4 (Middle C Range) ---
        61: '1', 62: '2', 63: '3', 64: '4', 65: '5', 66: '6', 67: '7',
        68: '8', 69: '9', 70: '0', 71: 'q', 72: 'w', 73: 'e', 74: 'r',
        // --- Octave 5 ---
        75: 't', 76: 'y', 77: 'u', 78: 'i', 79: 'o', 80: 'p', 81: 'a',
        82: 's', 83: 'd', 84: 'f', 85: 'g', 86: 'h', 87: 'j', 88: 'k',
        // --- Octave 6 ---
        89: 'l', 90: 'z', 91: 'x', 92: 'c', 93: 'v', 94: 'b', 95: 'n',
        96: 'm', 97: 'u', 98: 'o', 99: 'p', 100: 's', 101: 'f', 102: 'h',
        // --- Octave 7 (Highest) ---
        103: 'j', 104: 'y', 105: 'i', 106: 'a', 107: 'd', 108: 'g'
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                // Parse MIDI file using Tone.js Midi parser
                const midi = new Midi(arrayBuffer);
                
                let sheetResult = '';
                let notesByTime = {};

                // Group notes played simultaneously into chords based on timestamp
                midi.tracks.forEach(track => {
                    track.notes.forEach(note => {
                        // Round time slightly to group simultaneous notes into chords
                        const timeKey = Math.round(note.time * 25) / 25; 
                        if (!notesByTime[timeKey]) {
                            notesByTime[timeKey] = [];
                        }
                        if (robloxNotesMap[note.midi]) {
                            notesByTime[timeKey].push(robloxNotesMap[note.midi]);
                        }
                    });
                });

                // Sort timestamps sequentially
                const sortedTimes = Object.keys(notesByTime).sort((a, b) => a - b);
                let chordChunks = [];

                sortedTimes.forEach(time => {
                    const keys = notesByTime[time];
                    if (keys.length > 0) {
                        if (keys.length > 1) {
                            // Format chords with brackets [] as seen in Roblox sheets
                            chordChunks.push(`[${keys.join('')}]`);
                        } else {
                            chordChunks.push(keys[0]);
                        }
                    }
                });

                // Group text nicely into lines for readability
                for (let i = 0; i < chordChunks.length; i += 12) {
                    sheetResult += chordChunks.slice(i, i + 12).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No mappable piano notes found in this MIDI track range.";
                outputSection.classList.remove('hidden');

            } catch (err) {
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
