// YT2Midi - Exact Roblox Visual Layout Mapping Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Exact array corresponding 1-to-1 with the 48 sequential keys shown in your Roblox layout image (Left to Right)
    const robloxKeyLayout = [
        '1', '3', '4', '6', '8', '9', 'q', 'e', 't', // Lower sharp/flat tier segment 1
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm',
        'u', 'o', 'p', 's', 'f', 'h', 'j' // Upper modifier tier
    ];

    // Corresponding MIDI note values mapped to the physical sequence layout width
    const baseMidiStart = 36; // Starts at C2 / Low C

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);
                
                let notesByTime = {};

                // Parse all tracks and align notes directly to the layout indexes
                midi.tracks.forEach(track => {
                    track.notes.forEach(note => {
                        let midiNote = note.midi;

                        // Calculate relative position against the visual layout range
                        let layoutIndex = midiNote - baseMidiStart;

                        // Constrain index safely within the exact bounds of the Roblox keyboard array
                        if (layoutIndex >= 0 && layoutIndex < robloxKeyLayout.length) {
                            const mappedChar = robloxKeyLayout[layoutIndex];

                            // Quantize time into 0.05s windows to capture simultaneous chords accurately
                            const timeKey = Math.round(note.time * 20) / 20;

                            if (!notesByTime[timeKey]) {
                                notesByTime[timeKey] = [];
                            }

                            if (mappedChar && !notesByTime[timeKey].includes(mappedChar)) {
                                notesByTime[timeKey].push(mappedChar);
                            }
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

                // Format text cleanly into rows of 16 blocks for in-game pasting
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No notes fell within the visual keyboard range. Try a different MIDI file.";
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
            setTimeout(() => {
                copyText.textContent = 'Copy Sheet';
            }, 2000);
        });
    }
});
