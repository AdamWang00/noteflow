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

        let finalNotes = [];
        for (const note of combined.notes) {
            let noteName = Tone.Frequency(note.pitch, 'midi').toNote();
            noteName = noteName.substring(0, noteName.length - 1) + '/' + noteName[noteName.length - 1];
            const floored = Math.pow(2, Math.floor(Math.log(note.quantizedEndStep - note.quantizedStartStep) / Math.log(2)));
            const duration = 16 / floored;
            const noteObj = new StaveNote({
                keys: [noteName],
                duration: duration.toString(),
            });
            finalNotes.push(noteObj);
        }
        
        props.updateNotes(finalNotes);
    }

    return <button onClick={generateMelody}>generate</button>
}

export default Hello;