import React from 'react';
import * as mm from "@magenta/music";
import * as Tone from 'tone';
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

        // sequencer.matrix.populate.all([0]);
        // for (let note of combined.notes) {
        //     let column = note.quantizedStartStep;
        //     let noteName = Tone.Frequency(note.pitch, 'midi').toNote();
        //     let row = sequencerRows.indexOf(noteName);
        //     if (row >= 0) {
        //         sequencer.matrix.set.cell(column, row, 1);
        //     }
        // }
        console.log(combined);
    }

    return <button onClick={generateMelody}>generate</button>
}

export default Hello;