// YT2Midi - Bulletproof MIDI to Roblox Visual Sheet Parser
window.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Exact dictionary matching your Roblox piano layout keys from the screenshot
    const robloxMap = {
        36: '1', 37: '2', 38: '3', 39: '4', 40: '5', 41: '6', 42: '7', 43: '8', 44: '9', 45: '0',
        46: 'q', 47: 'w', 48: 'e', 49: 'r', 50: 't', 51: 'y', 52: 'u', 53: 'i', 54: 'o', 55: 'p',
        56: 'a', 57: 's', 58: 'd', 59: 'f', 60: 'g', 61: 'h', 62: 'j', 63: 'k', 64: 'l',
        65: 'z', 66: 'x', 67: 'c', 68: 'v', 69: 'b', 70: 'n', 71: 'm',
        72: 'u', 73: 'o', 74: 'p', 75: 's', 76: 'f', 77: 'h', 78: 'j',
        79: '1', 81: '3', 83: '4', 85: '6', 87: '8', 88: '9', 89: 'q', 91: 'e', 93: 't'
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                
                // Verify Tone.js Midi library is loaded
                if (typeof Midi === 'undefined') {
                    alert('MIDI parser library is still loading. Please wait a second and try uploading again.');
                    return;
                }

                const midi = new Midi(arrayBuffer);
                let notesByTime = {};
                let totalNotesFound = 0;

                // Loop through EVERY track in the MIDI file
                midi.tracks.forEach(track => {
                    if (track.notes && track.notes.length > 0) {
                        track.notes.forEach(note => {
                            totalNotesFound++;
                            let midiNum = note.midi;

                            // Shift notes into the layout range if they are too high/low
                            while (midiNum < 36) midiNum += 12;
                            while (midiNum > 93) midiNum -= 12;

                            const mappedChar = robloxMap[midiNum];
                            if (mappedChar) {
                                // Group notes by time (0.05s steps for chords)
                                const timeKey = Math.round(note.time * 20) / 20;
                                if (!notesByTime[timeKey]) {
                                    notesByTime[timeKey] = [];
                                }
                                if (!notesByTime[timeKey].includes(mappedChar)) {
                                    notesByTime[timeKey].push(mappedChar);
                                }
                            }
                        });
                    }
                });

                if (totalNotesFound === 0) {
                    sheetOutput.value = "Error: This MIDI file contains no readable note data.";
                    outputSection.classList.remove('hidden');
                    return;
                }

                const sortedTimes = Object.keys(notesByTime).sort((a, b) => a - b);
                let chordChunks = [];

                sortedTimes.forEach(time => {
                    const keys = notesByTime[time];
                    if (keys && keys.length > 0) {
                        if (keys.length > 1) {
                            chordChunks.push(`[${keys.join('')}]`);
                        } else {
                            chordChunks.push(keys[0]);
                        }
                    }
                });

                if (chordChunks.length === 0) {
                    sheetOutput.value = `Parsed ${totalNotesFound} notes, but none matched the layout range. Try a different piano MIDI file.`;
                    outputSection.classList.remove('hidden');
                    return;
                }

                // Format into neat lines of 16 for easy copy-pasting
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim();
                outputSection.classList.remove('hidden');

            } catch (err) {
                console.error("MIDI Parse Error:", err);
                alert('Failed to parse file. Make sure it is a genuine .mid format file.');
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
