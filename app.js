// YT2Midi - Complete Full-Layout Screenshot Mapping Engine
window.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Complete sequential layout from left to right based entirely on your screenshot image
    // Each index corresponds directly to a physical piano key on your interface.
    const fullRobloxLayout = [
        // --- Low Register ---
        { note: '1', type: 'white' }, { note: '2', type: 'black' }, { note: '3', type: 'white' },
        { note: '4', type: 'white' }, { note: '5', type: 'black' }, { note: '6', type: 'white' },
        { note: '7', type: 'black' }, { note: '8', type: 'white' }, { note: '9', type: 'black' },
        { note: '0', type: 'white' }, { note: 'q', type: 'black' }, { note: 'e', type: 'white' },
        { note: 'r', type: 'black' }, { note: 't', type: 'white' }, 

        // --- Middle Register ---
        { note: '1', type: 'white' }, { note: '!', type: 'black' },
        { note: '2', type: 'white' }, { note: '@', type: 'black' },
        { note: '3', type: 'white' },
        { note: '4', type: 'white' }, { note: '$', type: 'black' },
        { note: '5', type: 'white' }, { note: '%', type: 'black' },
        { note: '6', type: 'white' }, { note: '^', type: 'black' },
        { note: '7', type: 'white' },
        { note: '8', type: 'white' }, { note: '*', type: 'black' },
        { note: '9', type: 'white' }, { note: '(', type: 'black' },
        { note: '0', type: 'white' },
        { note: 'q', type: 'white' }, { note: 'Q', type: 'black' },
        { note: 'w', type: 'white' }, { note: 'W', type: 'black' },
        { note: 'e', type: 'white' }, { note: 'E', type: 'black' },
        { note: 'r', type: 'white' },
        { note: 't', type: 'white' }, { note: 'T', type: 'black' },
        { note: 'y', type: 'white' }, { note: 'Y', type: 'black' },
        { note: 'u', type: 'white' },
        { note: 'i', type: 'white' }, { note: 'I', type: 'black' },
        { note: 'o', type: 'white' }, { note: 'O', type: 'black' },
        { note: 'p', type: 'white' }, { note: 'P', type: 'black' },
        { note: 'a', type: 'white' },
        { note: 's', type: 'white' }, { note: 'S', type: 'black' },
        { note: 'd', type: 'white' }, { note: 'D', type: 'black' },
        { note: 'f', type: 'white' },
        { note: 'g', type: 'white' }, { note: 'G', type: 'black' },
        { note: 'h', type: 'white' }, { note: 'H', type: 'black' },
        { note: 'j', type: 'white' }, { note: 'J', type: 'black' },
        { note: 'k', type: 'white' },
        { note: 'l', type: 'white' }, { note: 'L', type: 'black' },
        { note: 'z', type: 'white' }, { note: 'Z', type: 'black' },
        { note: 'x', type: 'white' },
        { note: 'c', type: 'white' }, { note: 'C', type: 'black' },
        { note: 'v', type: 'white' }, { note: 'V', type: 'black' },
        { note: 'b', type: 'white' }, { note: 'B', type: 'black' },
        { note: 'n', type: 'white' }, { note: 'm', type: 'white' },

        // --- High Register ---
        { note: 'u', type: 'black' }, { note: 'u', type: 'white' },
        { note: 'o', type: 'black' }, { note: 'o', type: 'white' },
        { note: 'p', type: 'white' }, { note: 's', type: 'black' }, { note: 's', type: 'white' },
        { note: 'f', type: 'black' }, { note: 'f', type: 'white' },
        { note: 'h', type: 'white' }, { note: 'j', type: 'black' }, { note: 'j', type: 'white' }
    ];

    // Starting MIDI note for the leftmost key of this layout
    const midiStartRange = 28; // E1 / Low register start

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                
                if (typeof Midi === 'undefined') {
                    alert('Parser is still loading. Please try again in a moment.');
                    return;
                }

                const midi = new Midi(arrayBuffer);
                let notesByTime = {};

                // Scan all tracks and map notes precisely to layout indices
                midi.tracks.forEach(track => {
                    if (track.notes) {
                        track.notes.forEach(note => {
                            let layoutIndex = note.midi - midiStartRange;

                            // Ensure index fits safely inside our comprehensive key array
                            if (layoutIndex >= 0 && layoutIndex < fullRobloxLayout.length) {
                                const mappedChar = fullRobloxLayout[layoutIndex].note;

                                // Quantize chords cleanly into 0.05s steps
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
                    sheetOutput.value = "No matching notes found for this full layout range. Try another MIDI.";
                    outputSection.classList.remove('hidden');
                    return;
                }

                // Format into neat blocks of 16 for in-game pasting
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim();
                outputSection.classList.remove('hidden');

            } catch (err) {
                console.error("Error parsing MIDI:", err);
                alert('Could not parse the file. Ensure it is a valid .mid format.');
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
