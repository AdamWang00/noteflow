import React from 'react';
import * as mm from "@magenta/music";
import * as Tone from 'tone';
import Vex from 'vexflow';
const {StaveNote} = Vex.Flow;
// import * as p5 from 'p5';
// import * as ml5 from 'ml5';

console.log("MM MODULE:", mm);

let melodyRnn = new mm.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn");
let melodyRnnLoaded = melodyRnn.initialize();

const Hello = (props) => {
    const generateMelody = async () => {
        await melodyRnnLoaded;

        let seed = {
            notes: [
            { pitch: Tone.Frequency('C#3').toMidi(), quantizedStartStep: 0, quantizedEndStep: 4 }
            ],
            totalQuantizedSteps: 4,
            quantizationInfo: { stepsPerQuarter: 4}
        };
        let steps = 28;
        let temperature = 1.2;

        let result = await melodyRnn.continueSequence(seed, steps, temperature);

        let combined = mm.sequences.concatenate([seed, result]);

        var final_notes = [];
        for (let note of combined.notes) {
            let noteName = Tone.Frequency(note.pitch, 'midi').toNote();
            noteName = noteName.substring(0, noteName.length - 1) + '/' + noteName[noteName.length - 1];
            console.log(note.quantizedEndStep, note.quantizedStartStep);
            let duration = 16 / (note.quantizedEndStep - note.quantizedStartStep);
            let note_obj = new StaveNote({
                keys: [noteName],
                duration: duration,
            });
            final_notes.push(note_obj);
        }
        console.log(final_notes);

    }

    return <button onClick={generateMelody}>generate</button>
}

export default Hello;