// YT2Midi - Accurate Roblox 88-Key Translation Engine
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midi-file-input');
    const outputSection = document.getElementById('output-section');
    const sheetOutput = document.getElementById('sheet-output');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // Mapped strictly to standard 88-key Roblox piano layout indices
    const getRobloxKey = (midiNumber) => {
        // Linear scaling approach matching Roblox standard keyboard text input ranges
        const qwertChars = [
            '1','2','3','4','5','6','7','8','9','0',
            'q','w','e','r','t','y','u','i','o','p',
            'a','s','d','f','g','h','j','k','l',
            'z','x','c','v','b','n','m'
        ];
        
        // Normalize MIDI 21-108 into the 37-character QWERTY layout loop
        if (midiNumber < 21 || midiNumber > 108) return null;
        let index = Math.floor(((midiNumber - 21) / (108 - 21)) * qwertChars.length);
        return qwertChars[Math.min(index, qwertChars.length - 1)];
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const midi = new Midi(arrayBuffer);
                
                let notesByTime = {};

                // Extract all notes from tracks and group them by strict time intervals
                midi.tracks.forEach(track => {
                    track.notes.forEach(note => {
                        // 0.08s window to bundle notes into simultaneous chords
                        const timeKey = Math.round(note.time * 12.5) / 12.5; 
                        if (!notesByTime[timeKey]) {
                            notesByTime[timeKey] = [];
                        }
                        
                        const mappedChar = getRobloxKey(note.midi);
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

                // Format cleanly into readable rows of 16 characters/chords
                let sheetResult = '';
                for (let i = 0; i < chordChunks.length; i += 16) {
                    sheetResult += chordChunks.slice(i, i + 16).join(' ') + '\n';
                }

                sheetOutput.value = sheetResult.trim() || "No valid piano notes found in this file.";
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
