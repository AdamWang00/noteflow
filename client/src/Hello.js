import React from 'react';
import * as mm from "@magenta/music";
import * as Tone from 'tone';
import Vex from 'vexflow';
const {StaveNote} = Vex.Flow;
// import * as p5 from 'p5';
// import * as ml5 from 'ml5';

console.log("MM MODULE:", mm);

const melodyRnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
const melodyRnnLoaded = melodyRnn.initialize();

const Hello = (props) => {

    const generateMelody = async () => {
        await melodyRnnLoaded;

        const seed = {
            notes: [
            { pitch: Tone.Frequency('C4').toMidi(), quantizedStartStep: 0, quantizedEndStep: 4 }
            ],
            totalQuantizedSteps: 4,
            quantizationInfo: { stepsPerQuarter: 4}
        };
        const steps = 28;
        const temperature = 1.2;

        const result = await melodyRnn.continueSequence(seed, steps, temperature);

        const combined = mm.sequences.concatenate([seed, result]);

        console.log(combined.notes);

        let startSteps = [];
        for (let note of combined.notes) {
            startSteps.push(note.quantizedStartStep);
        }
        
        let noteRestsPairs = [];
        for (let i = 0; i < startSteps.length; i++) {
            const startDiff = (i + 1 == startSteps.length ? 32 : startSteps[i + 1]) - startSteps[i];
            const noteRests = [];
            const noteDuration = Math.pow(2, Math.floor(Math.log(startDiff) / Math.log(2)));
            console.log("Note", noteDuration);
            noteRests[0] = (16 / noteDuration).toString();

            const restTime = startDiff - noteDuration;
            let counter = 1;
            const rests = [];
            while (counter <= restTime) {
                console.log("rc", restTime, counter)
                const include = restTime & counter;
                if (include) rests.push((16 / counter).toString());
                counter <<= 1;
            }
            noteRests[1] = rests;
            console.log("Rests", rests);
            noteRestsPairs.push(noteRests);
        }
        
        let finalNotes = [];
        for (let i = 0; i < noteRestsPairs.length; i++) {
            let noteName = Tone.Frequency(combined.notes[i].pitch, 'midi').toNote();
            noteName = noteName.substring(0, noteName.length - 1) + '/' + noteName[noteName.length - 1];
            const noteObj = new StaveNote({
                keys: [noteName],
                duration: noteRestsPairs[i][0],
            });
            finalNotes.push(noteObj);
            noteRestsPairs[i][1].forEach((restDuration) => {
                const restObj = new StaveNote({
                    keys: ["b/4"],
                    duration: restDuration + "r",
                });
                finalNotes.push(restObj);
            });
        }
        
        props.updateNotes(finalNotes);
    }

    return <button onClick={generateMelody}>generate</button>
}

export default Hello;